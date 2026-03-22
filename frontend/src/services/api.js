const API = "http://localhost:5000";

// Helper — gets token from localStorage and adds it to headers
function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// ===== AUTH =====

export async function loginUser(username, password) {
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    } catch (err) {
        return { error: "Cannot connect to server" };
    }
}

export async function registerUser(username, password, role, email) {
    try {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role, email })
        });
        return await res.json();
    } catch (err) {
        return { error: "Cannot connect to server" };
    }
}

// ===== DASHBOARD =====

export async function getHostDashboard(roomCode) {
    try {
        const res = await fetch(`${API}/dashboard/host/${roomCode}`, {
            headers: authHeaders()
        });
        return await res.json();
    } catch (err) {
        return { data: null };
    }
}

export async function getUserUsage(userId) {
    try {
        const res = await fetch(`${API}/dashboard/user/${userId}`, {
            headers: authHeaders()
        });
        return await res.json();
    } catch (err) {
        return { data: null };
    }
}

// ===== ROOM =====

export async function createRoom(hostId, roomCode, roomPassword) {
    try {
        const res = await fetch(`${API}/host/create-room`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ hostId, roomCode, roomPassword })
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: "Cannot connect to server" };
    }
}

export async function joinRoom(userId, roomCode, roomPassword) {
    try {
        const res = await fetch(`${API}/host/join-room`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ userId, roomCode, roomPassword })
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: "Cannot connect to server" };
    }
}

export async function getRoomMembers(roomCode) {
    try {
        const res = await fetch(`${API}/host/room-members/${roomCode}`, {
            headers: authHeaders()
        });
        return await res.json();
    } catch (err) {
        return { success: false, members: [] };
    }
}

export async function toggleParentalMode(roomCode, enabled) {
    try {
        const res = await fetch(`${API}/host/parental-mode`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ roomCode, enabled })
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: "Cannot connect to server" };
    }
}

export async function leaveRoom(userId, roomCode) {
    try {
        const res = await fetch(`${API}/host/leave-room`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ userId, roomCode })
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: "Cannot connect to server" };
    }
}

// ===== NOTIFICATIONS =====

export async function sendAlertEmail(email, screenshotPath) {
    try {
        const res = await fetch(`${API}/notify/send-email`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ email, screenshotPath })
        });
        return await res.json();
    } catch (err) {
        return { success: false };
    }
}