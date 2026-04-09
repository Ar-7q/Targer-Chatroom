const userService = require("../services/user-service");

class UserController  {

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

}

module.exports = new UserController()