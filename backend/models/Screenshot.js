const mongoose = require("mongoose");

const ScreenshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imagePath: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Screenshot", ScreenshotSchema);
