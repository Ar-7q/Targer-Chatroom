const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema(
    {
        topic: { type: String, required: true },

        roomType: {
            type: String,
            enum: ['open', 'social', 'private'],
            required: true,
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        speakers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        // For private rooms
        allowedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema, 'rooms');