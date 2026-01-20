const mongoose = require("mongoose");

const HostRoomSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roomCode: String,
    roomPassword: String
});

module.exports = mongoose.model("HostRoom", HostRoomSchema);
