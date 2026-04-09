class RoomDto {
    id;
    topic;
    roomType;
    speakers;
    ownerId;
    createdAt;

    constructor(room) {
        this.id = room._id?.toString();   // ✅ small fix (safe + frontend friendly)
        this.topic = room.topic;
        this.roomType = room.roomType;
        this.ownerId = room.ownerId;
        this.speakers = (room.speakers || []).map((speaker) => {
            return {
                _id: speaker._id,
                name: speaker.name,
                avatar: speaker.avatar,
            };
        });
        this.allowedUsers = (room.allowedUsers || []).map((user) => {
            return {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
            };
        });

        this.createdAt = room.createdAt;
    }
}

module.exports = RoomDto;