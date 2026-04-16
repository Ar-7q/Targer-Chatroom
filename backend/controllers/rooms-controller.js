const RoomDto = require('../dtos/room-dto');
const roomService = require('../services/room-service');
const userService = require('../services/user-service');
class RoomsController {


    async create(req, res) {
        const { topic, roomType, allowedUsers } = req.body;

        if (!topic || !roomType) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // ✅ normalize topic
        const normalizedTopic = topic.trim().toLowerCase();

        // 🔴 check duplicate
        const existingRoom = await roomService.findByTopic(normalizedTopic);

        if (existingRoom) {
            return res.status(400).json({
                message: 'ROOM_ALREADY_EXISTS',
            });
        }

        const room = await roomService.create({
            topic: normalizedTopic,
            roomType,
            ownerId: req.user._id,
            allowedUsers,
        });

        return res.json(new RoomDto(room));
    }


    async index(req, res) {
        const userId = req.user._id;

        const rooms = await roomService.getAllRooms(userId);

        const allRooms = rooms.map((room) => new RoomDto(room));

        return res.json(allRooms);
    }


    async show(req, res) {
        const room = await roomService.getRoom(
            req.params.roomId,
            req.user._id
        );

        if (!room) {
            return res.status(403).json({ message: 'Access denied' });
        }

        return res.json(new RoomDto(room));
    }

    async invite(req, res) {
        const { roomId } = req.params;
        const { userIdToAdd } = req.body;

        if (!userIdToAdd) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const room = await roomService.getRoom(roomId, req.user._id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found or access denied' });
        }

        //only owner can invite
        if (room.ownerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only owner can invite users' });
        }

        // only private rooms
        if (room.roomType !== 'private') {
            return res.status(400).json({ message: 'Not a private room' });
        }

        //convert username → userId
        const user = await userService.findUser({ name: userIdToAdd });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // prevent duplicate invite (optional but recommended)
        const alreadyExists = room.allowedUsers.some(
            (u) => u.toString() === user._id.toString()
        );

        if (alreadyExists) {
            return res.status(400).json({ message: 'User already invited' });
        }

        const updatedRoom = await roomService.addUserToRoom(
            roomId,
            user._id
        );

        return res.json(new RoomDto(updatedRoom));
    }

    async removeUser(req, res) {
        const { roomId } = req.params;
        const { userIdToRemove } = req.body;

        if (!userIdToRemove) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const room = await roomService.getRoom(roomId, req.user._id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found or access denied' });
        }

        //only owner
        if (room.ownerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only owner can remove users' });
        }

        const updatedRoom = await roomService.removeUserFromRoom(
            roomId,
            userIdToRemove
        );

        if (!updatedRoom) {
            return res.status(400).json({ message: 'Cannot remove user' });
        }

        return res.json(new RoomDto(updatedRoom));
    }

    async leave(req, res) {
        const { roomId } = req.params;

        const result = await roomService.leaveRoom(
            roomId,
            req.user._id
        );

        if (!result) {
            return res.status(404).json({ message: 'Room not found' });
        }

        //if room deleted
        if (result.deleted) {
            return res.json({ message: 'Room deleted by owner' });
        }

        return res.json({ message: 'Left room successfully' });
    }

    async delete(req, res) {
        try {
            const { roomId } = req.params;

            const room = await roomService.findRoomById(roomId);

            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            // Only allow delete if:
            // 1. room is social
            // 2. user is owner
            if (room.roomType !== 'social') {
                return res.status(403).json({ message: 'Only social rooms can be deleted' });
            }

            if (room.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            await roomService.deleteRoom(roomId);

            return res.json({ message: 'Room deleted successfully' });

        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new RoomsController();