import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: String,
  hostCode: String,
  hostPass: String,
  parentEmail: String,
  hostRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostRoom"
  }
});

const User = mongoose.model("User", userSchema);

export default User;