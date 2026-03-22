import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import nodemailer from "nodemailer";
import Screenshot from "../models/Screenshot.js";

const router = express.Router();

// Setup upload folder
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Create transporter using env variables
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Screenshot upload
router.post("/upload-screenshot", upload.single("screenshot"), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        await Screenshot.create({
            userId,
            imagePath: req.file.path
        });

        res.json({ message: "Screenshot saved", path: req.file.path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send email alert
router.post("/send-email", async (req, res) => {
    try {
        const { email, screenshotPath } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email address required" });
        }

        const mailOptions = {
            from: `Zero Test Monitor <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "⚠ Zero Test — High Usage Alert",
            text: `A user in your room has exceeded usage thresholds!\n\nThis is an automated alert from Zero Test Monitor.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #ef4444;">⚠ High Usage Alert</h2>
                    <p>A user in your monitoring room has exceeded usage thresholds.</p>
                    <p style="color: #94a3b8;">This is an automated alert from Zero Test Monitor.</p>
                </div>
            `
        };

        // Build full path for screenshot
        let fullPath = null;
        if (screenshotPath) {
            fullPath = path.join(process.cwd(), "downloads", screenshotPath);
            console.log("Looking for screenshot at:", fullPath);

            if (fs.existsSync(fullPath)) {
                mailOptions.attachments = [{
                    filename: "screenshot.jpg",
                    path: fullPath
                }];
                console.log("Screenshot attached!");
            } else {
                console.log("Screenshot not found — sending without attachment");
                fullPath = null;
            }
        }

        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", email);

        // Delete screenshot from server after email sent
        if (fullPath) {
            try {
                fs.unlinkSync(fullPath);
                console.log("Screenshot deleted from server:", fullPath);
            } catch (err) {
                console.error("Failed to delete screenshot:", err.message);
            }
        }

        res.json({ message: "Email sent successfully" });

    } catch (err) {
        console.error("Email error:", err.message);
        res.status(500).json({ error: "Email failed", details: err.message });
    }
});

export default router;