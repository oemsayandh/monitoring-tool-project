import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// You MUST add the .js extension for your local models
import User from "../models/User.js";
import HostRoom from "../models/HostRoom.js";

const router = express.Router();
const SECRET = "MYSECRETKEY";

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const encrypted = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: encrypted, role });
        res.json({ message: "User Registered", user });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const check = await bcrypt.compare(password, user.password);
    if (!check) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
    res.json({ token, user });
});

// Create Host Room
router.post("/create-room", async (req, res) => {
    const { hostId, roomCode, roomPassword } = req.body;
    const room = await HostRoom.create({ hostId, roomCode, roomPassword });
    res.json({ message: "Room Created", room });
});

// Join Room
router.post("/join-room", async (req, res) => {
    const { userId, roomCode, roomPassword } = req.body;

    const room = await HostRoom.findOne({ roomCode, roomPassword });
    if (!room) return res.status(400).json({ error: "Invalid code or password" });

    await User.findByIdAndUpdate(userId, { hostRoomId: room._id });
    res.json({ message: "Joined Host Room" });
});

export default router;