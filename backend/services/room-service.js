const RoomModel = require('../models/room-model');

class RoomService {

    // ✅ CREATE ROOM
    async create(payload) {
        const { topic, roomType, ownerId, allowedUsers = [] } = payload;

        let finalAllowedUsers = [];

        if (roomType === 'private') {
            finalAllowedUsers = [...allowedUsers, ownerId]; // owner always included
        }

        const room = await RoomModel.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId],
            allowedUsers: finalAllowedUsers,
        });

        return room;
    }

    // ✅ GET ALL ROOMS (CORE LOGIC)
    async getAllRooms(userId) {
        const rooms = await RoomModel.find({
            $or: [
                // 🌍 PUBLIC
                { roomType: 'open' },

                // 👥 SOCIAL → only created by user
                {
                    roomType: 'social',
                    // ownerId: userId
                },

                // 🔒 PRIVATE → secure access
                {
                    roomType: 'private',
                    $or: [
                        { ownerId: userId },
                        { allowedUsers: { $in: [userId] } }
                    ]
                }
            ]
        })
            .populate('speakers')
            .populate('ownerId')
            .populate('allowedUsers') // ✅ ADDED
            .exec();

        return rooms;
    }

    // ✅ GET SINGLE ROOM (SECURE)
    async getRoom(roomId, userId) {
        const room = await RoomModel.findOne({ _id: roomId })
            .populate('speakers')
            .populate('ownerId')
            .populate('allowedUsers'); // ✅ ADDED

        if (!room) return null;

        // 🔒 protect private rooms
        if (room.roomType === 'private') {
            const isAllowed =
                room.ownerId._id.toString() === userId.toString() ||
                room.allowedUsers.some(
                    (u) => u.toString() === userId.toString()
                );

            if (!isAllowed) return null;
        }

        return room;
    }

    async addUserToRoom(roomId, userIdToAdd) {
        const room = await RoomModel.findById(roomId);

        if (!room) return null;

        // 🔒 ensure only private rooms
        if (room.roomType !== 'private') return null;

        // ✅ FIX ObjectId comparison (IMPORTANT)
        const alreadyExists = room.allowedUsers.some(
            (id) => id.toString() === userIdToAdd.toString()
        );

        if (!alreadyExists) {
            room.allowedUsers.push(userIdToAdd);
            await room.save();
        }

        // ✅ populate before returning (important for DTO)
        await room.populate('speakers');
        await room.populate('ownerId');
        await room.populate('allowedUsers');

        return room;
    }

    async removeUserFromRoom(roomId, userIdToRemove) {
        const room = await RoomModel.findById(roomId);

        if (!room) return null;

        // 🔒 only private rooms
        if (room.roomType !== 'private') return null;

        // ❌ cannot remove owner
        if (room.ownerId.toString() === userIdToRemove.toString()) {
            return null;
        }

        // ✅ remove user
        room.allowedUsers = room.allowedUsers.filter(
            (id) => id.toString() !== userIdToRemove.toString()
        );

        await room.save();

        // populate
        await room.populate('speakers');
        await room.populate('ownerId');
        await room.populate('allowedUsers'); // ✅ ADDED

        return room;
    }

    async leaveRoom(roomId, userId) {
        const room = await RoomModel.findById(roomId);

        if (!room) return null;

        // 🔥 DELETE ONLY IF PRIVATE + OWNER
        if (
            room.roomType === 'private' &&
            room.ownerId.toString() === userId.toString()
        ) {
            await RoomModel.deleteOne({ _id: roomId });
            return { deleted: true };
        }

        // 🔒 only private rooms need update
        if (room.roomType === 'private') {
            room.allowedUsers = room.allowedUsers.filter(
                (id) => id.toString() !== userId.toString()
            );

            await room.save();
        }

        return { deleted: false };
    }
    async findRoomById(roomId) {
        return await RoomModel.findById(roomId);
    }
    async deleteRoom(roomId) {
        return await RoomModel.findByIdAndDelete(roomId);
    }
}

module.exports = new RoomService();