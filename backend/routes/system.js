import express from "express";
import { sendAlertEmail } from "../utils/mailer.js";
import usageStore from "../memory/usageStore.js";
import SystemLog from "../models/SystemLog.js";
import multer from "multer";
import fs from "fs";
import User from "../models/User.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

async function handleMetrics(req, res) {

    const { userId, hostCode, cpu, ram, network, download, upload, uptime, parentEmail } = req.body;

    const userDoc = await User.findById(userId).select("username");
    // Save to memory store (for live dashboard)
    
    usageStore.setUsage(userId, {
        userId,
        username: userDoc ? userDoc.username : userId,
        hostCode,
        cpu,
        ram,
        network,
        download,
        upload,
        uptime,
        time: new Date().toISOString()
    });

    // Save to MongoDB (persistent history)
    try {
        await SystemLog.create({
            userId,
            cpu,
            ram,
            disk: 0,
            download,
            upload,
            network
        });
    } catch (err) {
        console.error("Failed to save to MongoDB:", err.message);
    }

    let anomaly = false;

    if (cpu > 70 || ram > 80) {
        anomaly = true;

        if (parentEmail) {
            try {
                await sendAlertEmail(
                    parentEmail,
                    "High Usage Alert",
                    `User ${userId} exceeded limits...\nCPU: ${cpu}%\nRAM: ${ram}%`,
                    req.file ? req.file.path : null
                );
                console.log("Alert email sent");
            } catch (err) {
                console.error("Email failed:", err.message);
            }
        }
    }

    if (req.file) {
        try {
            fs.unlinkSync(req.file.path);
            console.log("Uploaded file deleted:", req.file.path);
        } catch (err) {
            console.error("Failed to delete uploaded file:", err.message);
        }
    }

    res.json({ success: true, anomaly });
}

// C# agent posts here
router.post("/submit-usage", upload.single("screenshot"), handleMetrics);

// Keep old route working too
router.post("/upload", upload.single("screenshot"), handleMetrics);

export default router;