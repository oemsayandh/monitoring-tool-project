import express from "express";
import cors from "cors";
// 1. Move imports to the top 
// 2. Add the .js extension (MANDATORY in ES Modules)
import dashboardRoutes from "./routes/dashboard.js"; 

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/dashboard", dashboardRoutes);

// Simple test route
app.get("/", (req, res) => {
    res.send({ success: true, message: "Backend is working!" });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));