const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');

const arcjet = require('@arcjet/node').default;

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
        {
            name: "tokenBucket",
            mode: "LIVE",
            refillRate: 1,
            interval: 30,
            capacity: 1,
        },
    ],
});

class AuthController {

    async sendOtp(req, res) {

        //  Arcjet protection
        const decision = await aj.protect(req);

        const otpCooldown = global.otpCooldown || (global.otpCooldown = {});

        const contactKey = req.body.email || req.body.phone;

        if (otpCooldown[contactKey] && Date.now() - otpCooldown[contactKey] < 30000) {
            return res.status(429).json({
                message: "Wait 30 seconds before requesting another OTP",
            });
        }

        otpCooldown[contactKey] = Date.now();

        if (decision.isDenied()) {
            return res.status(429).json({
                message: "Too many requests 🚫",
            });
        }



        const { phone, email } = req.body;

        //  Email validation
        if (email && !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email!' });
        }

        if (!phone && !email) {
            return res.status(400).json({ message: 'Phone or Email required!' });
        }


        const normalizedEmail = email?.toLowerCase();

        const contact = phone || normalizedEmail;

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 2;
        const expires = Date.now() + ttl;
        const data = `${contact}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        try {
            //commented these because of the devlopment test
            if (phone) await otpService.sendBySms(phone, otp); // BLOCKED IT FOR PRE PRODUCTION VERSION TO NOT ADD COST
            if (normalizedEmail) await otpService.sendByEmail(normalizedEmail, otp);

            return res.json({
                hash: `${hash}.${expires}`,
                phone: phone || '',
                email: normalizedEmail || '',
                //otp , Remove in production 
            });

        } catch (err) {
            console.error("OTP ERROR:", err);
            return res.status(500).json({ message: 'message sending failed' });
        }
    }

    async verifyOtp(req, res) {

        const { otp, hash, phone, email } = req.body;

        if (!otp || !hash || (!phone && !email)) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        //  Normalize email
        const normalizedEmail = email?.toLowerCase();

        const contact = phone || normalizedEmail;

        const [hashedOtp, expires] = hash.split('.');

        if (Date.now() > +expires) {
            return res.status(400).json({ message: 'OTP expired!' });
        }

        //  OTP Attempt Limit
        const attempts = global.otpAttempts || (global.otpAttempts = {});
        const key = contact;

        if (!attempts[key]) attempts[key] = 0;

        if (attempts[key] >= 5) {
            return res.status(429).json({ message: 'Too many attempts ❌' });
        }

        const data = `${contact}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);

        if (!isValid) {
            attempts[key]++;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        //  reset attempts on success
        delete attempts[key];

        let user;

        try {
            // Improved user creation
            user = await userService.findUser(
                phone ? { phone } : { email: normalizedEmail }
            );

            if (!user) {
                const userData = {};

                if (phone) {
                    userData.phone = phone;
                }

                if (normalizedEmail) {
                    userData.email = normalizedEmail;
                }

                // EXTRA SAFETY (VERY IMPORTANT)
                if (!phone) delete userData.phone;
                if (!normalizedEmail) delete userData.email;

                user = await userService.createUser(userData);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Db error' });
        }

        const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id,
            activated: false,
        });

        await tokenService.storeRefreshToken(refreshToken, user._id);

        //  Cookie security improved
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'None',
            secure: true, // change to true in production (HTTPS)
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'None',
            secure: true, // change to true in production
        });

        const userDto = new UserDto(user);

        return res.json({ user: userDto, auth: true });
    }

    async refresh(req, res) {
        const { refreshToken: refreshTokenFromCookie } = req.cookies;

        if (!refreshTokenFromCookie) {
            return res.json({ user: null, auth: false });
        }

        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(
                refreshTokenFromCookie
            );
        } catch (err) {
            console.error(err);
            return res.json({ user: null, auth: false });
        }

        try {
            const token = await tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );


            if (!token) {
                return res.json({ user: null, auth: false });
            }

        } catch (err) {
            console.error(err);
            return res.json({ user: null, auth: false });
        }

        const user = await userService.findUser({ _id: userData._id });


        if (!user) {
            return res.json({ user: null, auth: false });
        }


        const { refreshToken, accessToken } = tokenService.generateTokens({
            _id: userData._id,
        });

        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            console.error(err);
            return res.json({ user: null, auth: false });
        }

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        });

        const userDto = new UserDto(user);

        return res.json({ user: userDto, auth: true });
    }

    async logout(req, res) {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            await tokenService.removeToken(refreshToken);
        }

        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');

        return res.json({ user: null, auth: false });
    }
}

module.exports = new AuthController();