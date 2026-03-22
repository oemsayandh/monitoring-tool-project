import dotenv from "dotenv";
dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "loaded" : "MISSING");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import systemRoutes from "./routes/system.js";
import hostRoutes from "./routes/host.js";
import notifyRoutes from "./routes/notify.js";
import User from "./models/User.js";
import HostRoom from "./models/HostRoom.js";

import { requireAuth } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/system-monitor")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Public routes — no auth needed
app.use("/auth", authRoutes);

// Public route for agent — no token needed
app.get("/agent/room-status/:roomCode", async (req, res) => {
    try {
        const room = await HostRoom.findOne({ roomCode: req.params.roomCode });
        if (!room) {
            return res.json({ parentalMode: false, hostEmail: "" });
        }

        const hostUser = await User.findById(room.hostId).select("email");

        res.json({
            parentalMode: room.parentalMode,
            hostEmail: hostUser ? hostUser.email : ""
        });
    } catch (err) {
        res.json({ parentalMode: false, hostEmail: "" });
    }
});

// Protected routes — must be logged in
app.use("/dashboard", requireAuth, dashboardRoutes);
app.use("/host", requireAuth, hostRoutes);
app.use("/notify", notifyRoutes);

// System route — open so C# agent can post without login
app.use("/system", systemRoutes);

// Download agent exe
app.get("/download/agent", (req, res) => {
    const filePath = path.join(__dirname, "downloads", "ZeroTestAgent.exe");
    res.download(filePath, "ZeroTestAgent.exe");
});

// Test route
app.get("/", (req, res) => {
    res.send({ success: true, message: "Backend is working!" });
});

app.listen(5000, () => console.log("Server running on port 5000"));