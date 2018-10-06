const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    passwordRestToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    roles: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

const User = module.exports = mongoose.model('User', UserSchema);