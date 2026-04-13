const UserDto = require("../dtos/user-dto");
const userService = require("../services/user-service");
const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');

class UserController {

    async search(req, res) {
        const { query } = req.query;

        if (!query) {
            return res.json([]);
        }

        try {
            const users = await userService.findUsersByName(query);
            return res.json(users);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Search failed' });
        }
    }

    async updateProfile(req, res) {
        const { name, avatar } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        try {
            // 🔥 check if username already exists
            const existingUser = await userService.findUser({ name });

            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            const user = await userService.findUser({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // ✅ update name
            user.name = name;

            // ✅ update avatar (ONLY if provided)
            if (avatar) {
                const buffer = Buffer.from(
                    avatar.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                );

                const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

                const sharp = require('sharp');
                const path = require('path');

                await sharp(buffer)
                    .resize(150, 150)
                    .toFile(path.resolve(__dirname, `../storage/${imagePath}`));

                user.avatar = `/storage/${imagePath}`;
            }

            await user.save();

            return res.json({
                user: new UserDto(user),
                auth: true
            });

        } catch (err) {
            console.error(err);
            if (err.code === 11000) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            return res.status(500).json({ message: 'Update failed' });
        }
    }

    async sendUpdateOtp(req, res) {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({ message: 'Phone or Email required' });
        }

        const contact = phone || email;
        const normalizedEmail = email?.toLowerCase();

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 2;
        const expires = Date.now() + ttl;

        const data = `${contact}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        try {
            // if (normalizedEmail) {
            //     await otpService.sendByEmail(normalizedEmail, otp);
            // }

            // optional sms
            // if (phone) {
            //     try {
            //         await otpService.sendBySms(phone, otp);
            //     } catch (err) {
            //         console.error("SMS failed:", err);
            //         return res.status(500).json({ message: 'SMS failed' });
            //     }
            // }

            return res.json({
                hash: `${hash}.${expires}`,
                phone: phone || '',
                email: normalizedEmail || '',
                otp
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'OTP failed' });
        }
    }

    async verifyUpdateOtp(req, res) {
        const { otp, hash, phone, email } = req.body;

        if (!otp || !hash || (!phone && !email)) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const contact = phone || email;
        const normalizedEmail = email?.toLowerCase();

        const [hashedOtp, expires] = hash.split('.');

        if (Date.now() > +expires) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const data = `${contact}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const userId = req.user._id;

        try {
            const user = await userService.findUser({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // 🔥 DUPLICATE CHECK
            const existingUser = await userService.findUser({
                $or: [
                    phone ? { phone } : null,
                    normalizedEmail ? { email: normalizedEmail } : null
                ].filter(Boolean)
            });

            if (
                existingUser &&
                existingUser._id.toString() !== userId.toString()
            ) {
                return res.status(400).json({
                    message: 'Phone or Email already in use'
                });
            }

            // ✅ UPDATE
            if (phone) user.phone = phone;
            if (normalizedEmail) user.email = normalizedEmail;

            await user.save();

            return res.json({
                user: new UserDto(user),
                auth: true,
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Update failed' });
        }
    }

}

module.exports = new UserController()