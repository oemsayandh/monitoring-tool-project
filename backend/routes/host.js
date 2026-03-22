import express from "express";
import User from "../models/User.js";
import HostRoom from "../models/HostRoom.js";

const router = express.Router();

// Host creates a room
router.post("/create-room", async (req, res) => {
  try {
    const { hostId, roomCode, roomPassword } = req.body;

    if (!hostId || !roomCode || !roomPassword) {
      return res.status(400).json({
        success: false,
        message: "hostId, roomCode and roomPassword are required"
      });
    }

    // Check if room code already taken
    const existing = await HostRoom.findOne({ roomCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Room code already taken — choose another"
      });
    }

    // Create the room
    const room = await HostRoom.create({
      hostId,
      roomCode,
      roomPassword,
      members: [hostId]
    });

    // Save room info on the host user
    await User.findByIdAndUpdate(hostId, {
      hostCode: roomCode,
      hostPass: roomPassword,
      hostRoomId: room._id
    });

    res.json({
      success: true,
      message: "Room created successfully",
      room
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User joins a room
router.post("/join-room", async (req, res) => {
  try {
    const { userId, roomCode, roomPassword } = req.body;

    if (!userId || !roomCode || !roomPassword) {
      return res.status(400).json({
        success: false,
        message: "userId, roomCode and roomPassword are required"
      });
    }

    // Find the room
    const room = await HostRoom.findOne({ roomCode, roomPassword });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Invalid room code or password"
      });
    }

    // Add user to members if not already in
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    // Save room info on the user
    await User.findByIdAndUpdate(userId, {
      hostCode: roomCode,
      hostPass: roomPassword,
      hostRoomId: room._id
    });

    res.json({
      success: true,
      message: "Joined room successfully",
      roomCode,
      hostId: room.hostId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all members of a room + their latest metrics
router.get("/room-members/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await HostRoom.findOne({ roomCode }).populate("members", "username role");
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const hostUser = await User.findById(room.hostId).select("email");

    res.json({
        success: true,
        roomCode,
        parentalMode: room.parentalMode,
        hostEmail: hostUser ? hostUser.email : "",
        members: room.members
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle parental mode on/off
router.post("/parental-mode", async (req, res) => {
  try {
    const { roomCode, enabled } = req.body;

    const room = await HostRoom.findOneAndUpdate(
      { roomCode },
      { parentalMode: enabled },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    
    res.json({
      success: true,
      message: `Parental mode ${enabled ? "enabled" : "disabled"}`,
      parentalMode: room.parentalMode
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leave a room
router.post("/leave-room", async (req, res) => {
  try {
    const { userId, roomCode } = req.body;

    await HostRoom.findOneAndUpdate(
      { roomCode },
      { $pull: { members: userId } }
    );

    await User.findByIdAndUpdate(userId, {
      hostCode: null,
      hostPass: null,
      hostRoomId: null
    });

    res.json({ success: true, message: "Left room successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;