const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("../backend/routes/auth");
const systemRoutes = require("../backend/routes/system");
const notifyRoutes = require("../backend/routes/notify");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/system-monitor")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/auth", authRoutes);
app.use("/system", systemRoutes);
app.use("/notify", notifyRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
const API = "http://localhost:3000"; // backend URL

async function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    let data = await res.json();

    if (!data.success) {
        document.getElementById("message").innerHTML = data.message;
        return;
    }
async function loadHostDashboard() {
    let user = JSON.parse(localStorage.getItem("user"));

    // Display host room code on page
    document.getElementById("roomCode").innerHTML = user.roomCode;

    // Fetch users assigned to this host
    let res = await fetch(`${API}/host/users/${user.roomCode}`);
    let data = await res.json();

    let list = document.getElementById("userList");
    list.innerHTML = "";

    // Add each user to list
    data.users.forEach(u => {
        list.innerHTML += `<li>${u.email}</li>`;
    });
}
async function loadUserDashboard() {
    let user = JSON.parse(localStorage.getItem("user"));

    let res = await fetch(`${API}/system/get/${user._id}`);
    let data = await res.json();

    createCPUChart(data.usage);
    createRAMChart(data.usage);
}
function createCPUChart(usage) {
    let ctx = document.getElementById("cpuChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: usage.map(u => u.time),
            datasets: [{
                label: "CPU Usage (%)",
                data: usage.map(u => u.cpu),
                borderColor: "red"
            }]
        }
    });
}
function createRAMChart(usage) {
    let ctx = document.getElementById("ramChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: usage.map(u => u.time),
            datasets: [{
                label: "RAM Usage (%)",
                data: usage.map(u => u.ram),
                borderColor: "blue"
            }]
        }
    });
}
async function toggleParentControl() {
    let enabled = document.getElementById("parentToggle").checked;
    let email = document.getElementById("parentEmail").value;
    let user = JSON.parse(localStorage.getItem("user"));

    await fetch(`${API}/parent/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: user._id,
            enabled: enabled,
            email: email
        })
    });

    alert("Parental control updated.");
}

    // Save token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "host") {
        window.location.href = "host.html";
    } else {
        window.location.href = "user.html";
    }
}
