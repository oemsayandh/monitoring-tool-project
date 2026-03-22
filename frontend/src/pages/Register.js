import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister() {
    if (!username || !password || !email) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const data = await registerUser(username, password, role, email);

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setMessage("Account created! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1500);
    setLoading(false);
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
      maxWidth: "400px"
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "28px"
    },
    logoDot: {
      width: "32px", height: "32px",
      background: "#534AB7",
      borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "16px"
    },
    logoText: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#f1f5f9"
    },
    title: {
      fontSize: "22px",
      fontWeight: "600",
      color: "#f1f5f9",
      margin: "0 0 6px 0"
    },
    subtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0 0 28px 0"
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
    roleCards: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "18px"
    },
    roleCard: (selected) => ({
      background: selected ? "#534AB720" : "#0f172a",
      border: `1px solid ${selected ? "#534AB7" : "#334155"}`,
      borderRadius: "8px",
      padding: "12px",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.15s"
    }),
    roleTitle: (selected) => ({
      fontSize: "13px",
      fontWeight: "600",
      color: selected ? "#a78bfa" : "#94a3b8",
      marginBottom: "4px"
    }),
    roleDesc: {
      fontSize: "11px",
      color: "#475569"
    },
    btn: {
      width: "100%",
      background: "#534AB7",
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
    footer: {
      textAlign: "center",
      marginTop: "24px",
      fontSize: "13px",
      color: "#64748b"
    },
    link: {
      color: "#a78bfa",
      textDecoration: "none",
      fontWeight: "500"
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>

        <div style={s.logo}>
          <div style={s.logoDot}>⬡</div>
          <span style={s.logoText}>Zero Test Monitor</span>
        </div>

        <h1 style={s.title}>Create an account</h1>
        <p style={s.subtitle}>Start monitoring your system in minutes</p>

        {error && <div style={s.error}>⚠ {error}</div>}
        {message && <div style={s.success}>✓ {message}</div>}

        <label style={s.label}>Username</label>
        <input
          style={s.input}
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <label style={s.label}>I am a...</label>
        <div style={s.roleCards}>
          <div style={s.roleCard(role === "user")} onClick={() => setRole("user")}>
            <div style={s.roleTitle(role === "user")}>User</div>
            <div style={s.roleDesc}>Join a room, share metrics</div>
          </div>
          <div style={s.roleCard(role === "host")} onClick={() => setRole("host")}>
            <div style={s.roleTitle(role === "host")}>Host</div>
            <div style={s.roleDesc}>Create a room, monitor others</div>
          </div>
        </div>

        <button style={s.btn} onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}