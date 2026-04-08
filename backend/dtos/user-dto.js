class UserDto {
    id;
    phone;
    email;   // ✅ ADD THIS
    name;
    avatar;
    activated;
    createdAt;

    constructor(user) {
        this.id = user?._id;
        this.phone = user?.phone || '';   // ✅ safe fallback
        this.email = user?.email || '';   // ✅ ADD THIS
        this.name = user?.name;
        this.avatar = user?.avatar;
        this.activated = user?.activated;
        this.createdAt = user?.createdAt;
    }
}

module.exports = UserDto;