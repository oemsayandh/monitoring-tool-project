import mongoose from "mongoose";

const ScreenshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imagePath: String,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Screenshot", ScreenshotSchema);