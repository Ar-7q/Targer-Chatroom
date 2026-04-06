const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema(
    {
        topic: { type: String, required: true },

        roomType: {
            type: String,
            required: true
            // ✅ (optional but recommended: enum)
            
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true   // ✅ ADDED (important)
        },

        speakers: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
            default: [],
            required:false,   // ✅ ADDED (better than undefined)
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Room', roomSchema, 'rooms');