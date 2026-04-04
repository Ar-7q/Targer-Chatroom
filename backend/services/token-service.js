const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
const refreshModel = require('../models/refresh-model');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1h',
        });

        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y',
        });

        return { accessToken, refreshToken };
    }

    async storeRefreshToken(token, userId) {
        try {
            await refreshModel.create({
                token,
                userId,
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    async verifyAccessToken(token) {
        try {
            return jwt.verify(token, accessTokenSecret);
        } catch (err) {
            return null;
        }
    }

    // ✅ ADD THIS (important)
    async verifyRefreshToken(token) {
        try {
            return jwt.verify(token, refreshTokenSecret);
        } catch (err) {
            return null;
        }
    }
}

module.exports = new TokenService();