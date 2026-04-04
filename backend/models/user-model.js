const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true // ✅ IMPORTANT
        },
        name: { type: String },
        avatar: { type: String },
        activated: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema, 'users');