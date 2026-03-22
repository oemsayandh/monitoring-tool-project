import mongoose from "mongoose";

const hostRoomSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomCode: {
    type: String,
    unique: true,
    required: true
  },
  roomPassword: {
    type: String,
    required: true
  },
  parentalMode: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("HostRoom", hostRoomSchema);