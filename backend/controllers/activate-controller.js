const sharp = require('sharp'); // removed jimp as it is outdated
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');

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

        const imagePath = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.png`;

        try {
            await sharp(buffer) 
                .resize(150, 150) 
                .toFile(path.resolve(__dirname, `../storage/${imagePath}`));
        } catch (err) {
            console.error('Sharp error:', err);
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
            user.avatar = `/storage/${imagePath}`.trim();

            await user.save();

            return res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}

module.exports = new ActivateController();