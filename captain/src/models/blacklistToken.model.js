const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
});

const blacklistTokenModel = mongoose.model("blacklist-tokens", blacklistTokenSchema);

module.exports = blacklistTokenModel;