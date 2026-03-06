import express from "express";
import { sendAlertEmail } from "../utils/mailer.js";
import usageStore from "../memory/usageStore.js";
import multer from "multer";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Uploads folder

router.post("/upload", upload.single("screenshot"), async (req, res) => {
    const { userId, hostCode, cpu, ram, network, uptime, parentEmail } = req.body;

    // Store usage data
    usageStore.setUsage(userId, {
        userId,
        hostCode,
        cpu,
        ram,
        network,
        uptime,
        time: new Date().toISOString()
    });

    let anomaly = false;

    if (cpu > 70 || ram > 80) {
        anomaly = true;

        if (parentEmail) {
            try {
                // Send alert email with screenshot if exists
                await sendAlertEmail(
                    parentEmail,
                    " High Usage Alert",
                    `User ${userId} exceeded limits...\nCPU: ${cpu}%\nRAM: ${ram}%`,
                    req.file ? req.file.path : null
                );

                console.log("Alert email sent");
            } catch (err) {
                console.error("Email failed:", err.message);
            }
        }
    }

    //  Clean uploaded file whether anomaly or not
    if (req.file) {
        try {
            fs.unlinkSync(req.file.path);
            console.log("Uploaded file deleted:", req.file.path);
        } catch (err) {
            console.error("Failed to delete uploaded file:", err.message);
        }
    }

    // Send response
    res.json({ success: true, anomaly });
});

export default router;