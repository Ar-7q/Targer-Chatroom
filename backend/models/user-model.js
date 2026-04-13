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
            get: (avatar) => {
                return avatar ? `${process.env.BASE_URL}${avatar}` : avatar;
            },
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