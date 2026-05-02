const mongoose = require("mongoose");

const captainSchema = new mongoose.Schema({
    name: {
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
    isAvailable: {
        type: Boolean,
        default: false
    }
});

const captainModel = mongoose.model("captains", captainSchema);

module.exports = captainModel;