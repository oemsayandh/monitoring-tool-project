import express from "express"; // Change require to import
const router = express.Router();

// Note: You must add .js to your own file imports too!
import usageStore from "../memory/usageStore.js"; 

// GET user’s own usage
router.get("/user/:userId", (req, res) => {
    let data = usageStore.getUsage(req.params.userId);
    res.json({ success: true, data });
});

// GET all usage under same host
router.get("/host/:hostCode", (req, res) => {
    let data = usageStore.getAllForHost(req.params.hostCode);
    res.json({ success: true, data });
});

export default router;