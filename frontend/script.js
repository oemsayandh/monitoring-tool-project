const backend = "http://localhost:5000";
let user = null;

// LOGIN
async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    let res = await fetch(backend + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let data = await res.json();

    if (data.error) {
        document.getElementById("msg").innerText = data.error;
        return;
    }

    user = data.user;

    if (role === "host") {
        window.location.href = "host.html";
    } else {
        window.location.href = "user.html";
    }
}

// CREATE ROOM
async function createRoom() {
    let roomCode = document.getElementById("roomCode").value;
    let roomPassword = document.getElementById("roomPass").value;

    let res = await fetch(backend + "/auth/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: user._id, roomCode, roomPassword })
    });

    let data = await res.json();
    document.getElementById("roomMsg").innerText = data.message;
}

// LOAD USERS IN HOST ROOM
async function loadUsers() {
    let res = await fetch(backend + "/system/get-all-users/" + user._id);
    let data = await res.json();

    let list = document.getElementById("userList");
    list.innerHTML = "";

    data.forEach(u => {
        list.innerHTML += `<p>${u.username} - User ID: ${u._id}</p>`;
    });
}

// USER JOINS ROOM
async function joinRoom() {
    let code = document.getElementById("joinCode").value;
    let pass = document.getElementById("joinPass").value;

    let res = await fetch(backend + "/auth/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, roomCode: code, roomPassword: pass })
    });

    let data = await res.json();
    document.getElementById("joinMsg").innerText = data.message;
}

// USER LOADS USAGE LOGS
async function loadMyUsage() {
    let res = await fetch(backend + "/system/get-user-usage/" + user._id);
    let logs = await res.json();

    let list = document.getElementById("usageList");
    list.innerHTML = "";

    logs.forEach(log => {
        list.innerHTML += `<p>CPU: ${log.cpu}% | RAM: ${log.ram}%</p>`;
    });
}

// SAVE PARENTAL CONTROL SETTINGS
async function saveParental() {
    let pcToggle = document.getElementById("pcToggle").value === "true";
    let pcEmail = document.getElementById("pcEmail").value;
    let cpu = parseInt(document.getElementById("pcCPU").value);
    let ram = parseInt(document.getElementById("pcRAM").value);

    // Update config through backend
    let res = await fetch(backend + "/notify/save-parental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: user._id,
            parentControl: pcToggle,
            email: pcEmail,
            thresholdCPU: cpu,
            thresholdRAM: ram
        })
    });

    let data = await res.json();
    document.getElementById("pcMsg").innerText = data.message;
}
