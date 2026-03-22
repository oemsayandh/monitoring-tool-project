import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    if (!username || !password) {
      setMessage("Please enter username and password");
      return;
    }

    setLoading(true);
    setMessage("");

    const data = await loginUser(username, password);

    if (data.error) {
      setMessage(data.error);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    if (data.user.role === "host") {
      navigate("/host");
    } else {
      navigate("/user");
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

        <h1 style={s.title}>Welcome back</h1>
        <p style={s.subtitle}>Sign in to your monitoring dashboard</p>

        {message && <div style={s.error}>⚠ {message}</div>}

        <label style={s.label}>Username</label>
        <input
          style={s.input}
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />

        <button style={s.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={s.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={s.link}>Register here</Link>
        </div>

      </div>
    </div>
  );
}