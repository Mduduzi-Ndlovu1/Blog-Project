const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true // Add this line to create a unique index
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('User', UserSchema);
