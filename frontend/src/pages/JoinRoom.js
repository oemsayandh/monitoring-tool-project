import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  async function handleJoin() {
    if (!roomCode || !roomPassword) {
      setError("Both room code and password are required");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/host/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          roomCode,
          roomPassword
        })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // Update user in localStorage with room info
      const updatedUser = { ...user, hostCode: roomCode };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Joined successfully! Redirecting...");
      setTimeout(() => navigate("/user"), 1500);

    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  const s = {
    wrap: {
      background: "#0f172a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "40px",
      width: "100%",
      maxWidth: "420px"
    },
    badge: {
      display: "inline-block",
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#94a3b8",
      padding: "4px 12px",
      borderRadius: "99px",
      fontSize: "11px",
      fontWeight: "500",
      marginBottom: "20px"
    },
    title: {
      fontSize: "22px",
      fontWeight: "600",
      color: "#f1f5f9",
      margin: "0 0 8px 0"
    },
    subtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0 0 28px 0",
      lineHeight: "1.5"
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "500",
      color: "#94a3b8",
      marginBottom: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    input: {
      width: "100%",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "14px",
      color: "#f1f5f9",
      fontFamily: "'Inter', sans-serif",
      boxSizing: "border-box",
      marginBottom: "18px",
      outline: "none"
    },
    btn: {
      width: "100%",
      background: "#0ea5e9",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      margin: "0",
      opacity: loading ? 0.6 : 1
    },
    error: {
      background: "#ef444415",
      border: "1px solid #ef444460",
      color: "#ef4444",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "13px",
      marginBottom: "16px"
    },
    success: {
      background: "#22c55e15",
      border: "1px solid #22c55e60",
      color: "#22c55e",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "13px",
      marginBottom: "16px"
    },
    backLink: {
      display: "block",
      textAlign: "center",
      marginTop: "20px",
      fontSize: "13px",
      color: "#64748b",
      cursor: "pointer",
      textDecoration: "none"
    },
    divider: {
      textAlign: "center",
      color: "#334155",
      fontSize: "12px",
      margin: "20px 0",
      borderTop: "1px solid #1e293b",
      paddingTop: "20px"
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>

        <span style={s.badge}>USER MODE</span>
        <h1 style={s.title}>Join a Room</h1>
        <p style={s.subtitle}>
          Enter the room code and password provided by your host
          to start sharing your system metrics.
        </p>

        {error && <div style={s.error}>⚠ {error}</div>}
        {message && <div style={s.success}>✓ {message}</div>}

        <label style={s.label}>Room Code</label>
        <input
          style={s.input}
          placeholder="e.g. MYROOM01"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          maxLength={12}
        />

        <label style={s.label}>Room Password</label>
        <input
          style={s.input}
          type="password"
          placeholder="Enter room password"
          value={roomPassword}
          onChange={e => setRoomPassword(e.target.value)}
        />

        <button style={s.btn} onClick={handleJoin} disabled={loading}>
          {loading ? "Joining..." : "Join Room"}
        </button>

        <div style={s.divider}>
          Don't have a room code? Ask your host.
        </div>

        <a style={s.backLink} onClick={() => navigate("/user")}>
          ← Back to dashboard
        </a>

      </div>
    </div>
  );
}