class UserDto {
    id;
    phone;
    activated;
    createdAt;

    constructor(user) {
        if (!user) return

        this.id = user._id;
        this.phone = user.phone;
        this.activated = user.activated;
        this.createdAt = user.createdAt;
    }
}

module.exports = UserDto;