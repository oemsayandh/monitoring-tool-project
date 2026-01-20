const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ["host", "user"] },
    hostRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "HostRoom", default: null }
});

module.exports = mongoose.model("User", UserSchema);
