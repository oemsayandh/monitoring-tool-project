import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboard.js"; 
import systemRoutes from "./routes/system.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/dashboard", dashboardRoutes);
app.use("/system", systemRoutes);


// Simple test route
app.get("/", (req, res) => {
    res.send({ success: true, message: "Backend is working!" });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
