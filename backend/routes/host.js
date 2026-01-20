import express from "express"; // Change require to import
const router = express.Router();

// MANDATORY: Add the .js extension for your local files
import User from "../models/User.js"; 

// Host creates a room
router.post("/create-room", async (req, res) => {
    try {
        const { hostId, hostCode, hostPass } = req.body;
        await User.findByIdAndUpdate(hostId, { hostCode, hostPass });
        res.json({ success: true, message: "Host room created" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User joins a host room
router.post("/join-room", async (req, res) => {
    try {
        const { userId, hostCode, hostPass } = req.body;

        let host = await User.findOne({ hostCode, hostPass });
        if (!host) return res.json({ success: false, message: "Invalid host room" });

        await User.findByIdAndUpdate(userId, { hostCode, hostPass });

        res.json({ success: true, message: "Joined host room" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;