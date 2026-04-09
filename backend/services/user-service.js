const UserModel = require('../models/user-model');


class UserService {
    async findUser(filter) {
        const user = await UserModel.findOne(filter);
        return user;
    }

    async createUser(data) {
        const user = await UserModel.create(data);
        return user;
    }

    async findUsersByName(query) {
        return await UserModel.find({
            name: { $regex: query, $options: 'i' }
        })
            .select('_id name avatar')
            .limit(5); // 🔥 IMPORTANT
    }
}

module.exports = new UserService();