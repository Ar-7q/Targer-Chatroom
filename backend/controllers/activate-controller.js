const sharp = require('sharp'); // removed jimp as it is outdated
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
const cloudinary = require('../utils/cloudinary')

class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body;

        if (!name || !avatar) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const buffer = Buffer.from(
            avatar.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
        );

        let result;

        try {
            const processedBuffer = await sharp(buffer)
                .resize(150, 150)
                .jpeg({ quality: 60 }) // compression
                .toBuffer();

            result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "ArpitBackend/avatars",
                        public_id: `avatar_${Date.now()}`
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(processedBuffer);
            });

        } catch (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ message: 'Could not process the image' });
        }

        const userId = req.user._id;

        try {
            const user = await userService.findUser({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: 'User not found!' });
            }

            user.activated = true;
            user.name = name;
            user.avatar = result.secure_url;

            await user.save();

            return res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}

module.exports = new ActivateController();