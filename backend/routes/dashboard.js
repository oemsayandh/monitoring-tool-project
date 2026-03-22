import express from "express";
import usageStore from "../memory/usageStore.js";

const router = express.Router();

// GET user's own latest metrics
router.get("/user/:userId", (req, res) => {
    const data = usageStore.getUsage(req.params.userId);

    if (!data) {
        return res.json({ success: false, data: null, message: "No data yet for this user" });
    }

    res.json({ success: true, data });
});

// GET all users under a host room
router.get("/host/:hostCode", (req, res) => {
    const data = usageStore.getAllForHost(req.params.hostCode);

    if (!data || Object.keys(data).length === 0) {
        return res.json({ success: true, data: {}, message: "No users in room yet" });
    }

    res.json({ success: true, data });
});

export default router;