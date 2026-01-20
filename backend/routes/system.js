import express from "express"; // Change require to import
const router = express.Router();

// MANDATORY: Add the .js extension for your memory store
import usageStore from "../memory/usageStore.js"; 

router.post("/upload", async (req, res) => {
    try {
        const { userId, hostCode, cpu, ram, network, uptime } = req.body;

        // Save to your in-memory store
        usageStore.setUsage(userId, {
            userId,
            hostCode,
            cpu,
            ram,
            network,
            uptime,
            time: new Date().toISOString()
        });

        console.log(`[${new Date().toLocaleTimeString()}] Updated usage for: ${userId} | CPU: ${cpu}% | RAM: ${ram}%`);

        // Basic anomaly detection logic
        let anomaly = false;
        if (cpu > 70 || ram > 80) {
            anomaly = true;
            console.log(`⚠️ ANOMALY DETECTED for ${userId}`);
        }

        res.json({ success: true, anomaly });
    } catch (error) {
        console.error("Error processing usage upload:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;