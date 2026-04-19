const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
        name: { type: String, unique: true
            
         },
        avatar: {
            type: String,
            
        },
        activated: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true }
    }
);

module.exports = mongoose.model('User', userSchema, 'users');