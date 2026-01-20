import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
// MANDATORY: .js extension for your local model
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

// Email screenshot
router.post("/send-email", async (req, res) => {
    try {
        const { email, screenshotPath } = req.body;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { 
                user: "your@gmail.com", 
                pass: "your_app_password" // Use App Passwords, not your real password!
            }
        });

        await transporter.sendMail({
            from: "System Monitor",
            to: email,
            subject: "Screenshot Alert",
            text: "Usage threshold exceeded!",
            attachments: [{ path: screenshotPath }]
        });

        res.json({ message: "Email sent" });
    } catch (err) {
        res.status(500).json({ error: "Email failed", details: err.message });
    }
});

export default router;