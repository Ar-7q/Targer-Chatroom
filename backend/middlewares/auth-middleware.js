const tokenService = require('../services/token-service');

module.exports = async function (req, res, next) {
    try {
        const accessToken = req.cookies?.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const userData = await tokenService.verifyAccessToken(accessToken);

        if (!userData) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = userData;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};