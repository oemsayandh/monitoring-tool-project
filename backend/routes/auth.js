import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "MYSECRETKEY";

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, password, role, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, email and password are required" });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const encrypted = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: encrypted,
            role: role || "user",
            email
        });

        res.json({ message: "User registered successfully", user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(401).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;