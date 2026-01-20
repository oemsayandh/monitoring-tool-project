const mongoose = require("mongoose");

const SystemLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cpu: Number,
    ram: Number,
    disk: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SystemLog", SystemLogSchema);
