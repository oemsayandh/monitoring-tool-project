import mongoose from "mongoose";

const SystemLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cpu: Number,
    ram: Number,
    disk: Number,
    download: Number,
    upload: Number,
    network: Number,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("SystemLog", SystemLogSchema);