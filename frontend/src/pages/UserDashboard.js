import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getUserUsage } from "../services/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      borderWidth: 1,
      titleColor: "#94a3b8",
      bodyColor: "#e2e8f0",
    }
  },
  scales: {
    x: {
      grid: { color: "#1e293b" },
      ticks: { color: "#64748b", font: { size: 11 } }
    },
    y: {
      grid: { color: "#1e293b" },
      ticks: { color: "#64748b", font: { size: 11 } },
      min: 0,
      max: 100
    }
  },
  elements: {
    line: { tension: 0.4 },
    point: { radius: 2, hoverRadius: 4 }
  }
};

const networkChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      grid: { color: "#1e293b" },
      ticks: { color: "#64748b", font: { size: 11 } },
      min: 0
    }
  }
};

export default function UserDashboard() {
  const [usage, setUsage] = useState([]);
  const [latest, setLatest] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("--");
  const [anomaly, setAnomaly] = useState(false);
  const [configDownloaded, setConfigDownloaded] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadUsage();
    const timer = setInterval(loadUsage, 3000);
    return () => clearInterval(timer);
  }, []);

  async function loadUsage() {
    try {
      const data = await getUserUsage(user._id);
      if (!data.data) return;

      const entries = Array.isArray(data.data)
        ? data.data
        : [data.data];

      setUsage(prev => {
        const updated = [...prev, ...entries].slice(-20);
        return updated;
      });

      const last = entries[entries.length - 1];
      setLatest(last);
      setLastUpdate(new Date().toLocaleTimeString());
      setAnomaly(last.cpu > 70 || last.ram > 80);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }

  function copyUserId() {
    navigator.clipboard.writeText(user._id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }

  function downloadConfig() {
    const config = {
      userId: user._id,
      hostCode: user.hostCode || "",
      backendUrl: "http://localhost:5000",
      thresholdCPU: 70,
      thresholdRAM: 80,
      parentControl: false,
      email: user.parentEmail || ""
    };

    const blob = new Blob(
      [JSON.stringify(config, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    a.click();
    URL.revokeObjectURL(url);

    setConfigDownloaded(true);
    setTimeout(() => setConfigDownloaded(false), 3000);
  }

  const timeLabels = usage.map(u =>
    new Date(u.time).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })
  );

  const makeDataset = (label, data, color) => ({
    labels: timeLabels,
    datasets: [{
      label,
      data,
      borderColor: color,
      backgroundColor: color + "22",
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
    }]
  });

  const cpu = latest?.cpu ?? 0;
  const ram = latest?.ram ?? 0;
  const download = latest?.download ?? 0;
  const upload = latest?.upload ?? 0;
  const network = latest?.network ?? 0;

  const s = {
    wrap: {
      background: "#0f172a",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      color: "#e2e8f0"
    },
    topbar: {
      background: "#0f172a",
      borderBottom: "1px solid #1e293b",
      padding: "16px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    topbarLeft: { display: "flex", alignItems: "center", gap: "14px" },
    title: { fontSize: "18px", fontWeight: "600", color: "#f1f5f9", margin: 0 },
    userBadge: {
      background: "#1e293b",
      border: "1px solid #334155",
      color: "#94a3b8",
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontFamily: "monospace"
    },
    idBadge: {
      background: idCopied ? "#534AB720" : "#1e293b",
      border: `1px solid ${idCopied ? "#534AB7" : "#534AB7"}`,
      color: idCopied ? "#22c55e" : "#a78bfa",
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontFamily: "monospace",
      cursor: "pointer",
      transition: "all 0.2s",
      userSelect: "all"
    },
    statusDot: {
      width: "8px", height: "8px",
      borderRadius: "50%",
      background: anomaly ? "#ef4444" : "#22c55e",
      boxShadow: anomaly ? "0 0 8px #ef4444" : "0 0 8px #22c55e",
      display: "inline-block"
    },
    statusText: {
      fontSize: "12px",
      color: anomaly ? "#ef4444" : "#22c55e",
      fontWeight: "500"
    },
    updateText: { fontSize: "11px", color: "#475569" },
    btnAgent: {
      background: "transparent",
      border: "1px solid #a855f7",
      color: "#a855f7",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center"
    },
    btnConfig: {
      background: configDownloaded ? "#10b98120" : "transparent",
      border: "1px solid #10b981",
      color: "#10b981",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      width: "auto",
      margin: 0,
      transition: "all 0.2s"
    },
    btnJoin: {
      background: "transparent",
      border: "1px solid #0ea5e9",
      color: "#0ea5e9",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      width: "auto",
      margin: 0
    },
    body: { padding: "24px 28px" },
    agentBanner: {
      background: "#534AB710",
      border: "1px solid #534AB740",
      borderRadius: "8px",
      padding: "14px 18px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "10px"
    },
    agentBannerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#a78bfa"
    },
    agentBannerRight: {
      fontSize: "11px",
      color: "#475569"
    },
    alertBanner: {
      background: "#ef444415",
      border: "1px solid #ef444460",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#ef4444"
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "16px",
      marginBottom: "24px"
    },
    statCard: (color) => ({
      background: "#1e293b",
      border: "1px solid #334155",
      borderTop: `2px solid ${color}`,
      borderRadius: "10px",
      padding: "16px 20px",
    }),
    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontWeight: "500",
      marginBottom: "8px",
      display: "block"
    },
    statValue: (color) => ({
      fontSize: "26px",
      fontWeight: "600",
      color: color,
      margin: "0 0 4px 0"
    }),
    statSub: { fontSize: "11px", color: "#475569" },
    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px"
    },
    chartCard: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "18px 20px",
    },
    chartTitle: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#94a3b8",
      marginBottom: "14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    chartWrap: { height: "220px" },
  };

  return (
    <div style={s.wrap}>

      {/* Top Bar */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <h1 style={s.title}>Zero Test Monitor</h1>
          <span style={s.userBadge}>USER: {user.username}</span>
          <span
            style={s.idBadge}
            onClick={copyUserId}
            title="Click to copy your User ID"
          >
            {idCopied ? "✓ Copied!" : `ID: ${user._id}`}
          </span>
          <span style={s.statusDot}></span>
          <span style={s.statusText}>{anomaly ? "ANOMALY DETECTED" : "NORMAL"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.updateText}>Updated {lastUpdate}</span>
          
           <a href="http://localhost:5000/download/agent"
            download="ZeroTestAgent.exe"
            style={s.btnAgent}
          >
            Download Agent
          </a>
          <button style={s.btnConfig} onClick={downloadConfig}>
            {configDownloaded ? "✓ Downloaded!" : "Download Config"}
          </button>
          <button style={s.btnJoin} onClick={() => navigate("/join-room")}>
            Join Room
          </button>
        </div>
      </div>

      <div style={s.body}>

        {/* Agent Setup Banner */}
        {!latest && (
          <div style={s.agentBanner}>
            <div style={s.agentBannerLeft}>
              <span>⬡</span>
              <span>
                Agent not running yet — click your ID badge to copy it, then download and run the agent
              </span>
            </div>
            <div style={s.agentBannerRight}>
              1. Copy your ID → 2. Download Agent → 3. Download Config → 4. Put both in same folder → 5. Double click exe
            </div>
          </div>
        )}

        {/* Anomaly Alert Banner */}
        {anomaly && (
          <div style={s.alertBanner}>
            <span>⚠</span>
            <span>
              High resource usage detected — CPU: <strong>{cpu}%</strong> · RAM: <strong>{ram}%</strong>
            </span>
          </div>
        )}

        {/* Stat Cards */}
        <div style={s.statGrid}>
          <div style={s.statCard("#3b82f6")}>
            <span style={s.statLabel}>CPU Usage</span>
            <p style={s.statValue(cpu > 70 ? "#ef4444" : "#3b82f6")}>{cpu}%</p>
            <p style={s.statSub}>{cpu > 70 ? "⚠ High" : "Normal"}</p>
          </div>
          <div style={s.statCard("#a855f7")}>
            <span style={s.statLabel}>RAM Usage</span>
            <p style={s.statValue(ram > 80 ? "#ef4444" : "#a855f7")}>{ram}%</p>
            <p style={s.statSub}>{ram > 80 ? "⚠ High" : "Normal"}</p>
          </div>
          <div style={s.statCard("#06b6d4")}>
            <span style={s.statLabel}>Download</span>
            <p style={s.statValue("#06b6d4")}>
              {download} <span style={{ fontSize: "13px" }}>MB/s</span>
            </p>
            <p style={s.statSub}>inbound</p>
          </div>
          <div style={s.statCard("#10b981")}>
            <span style={s.statLabel}>Upload</span>
            <p style={s.statValue("#10b981")}>
              {upload} <span style={{ fontSize: "13px" }}>MB/s</span>
            </p>
            <p style={s.statSub}>outbound</p>
          </div>
          <div style={s.statCard("#f59e0b")}>
            <span style={s.statLabel}>Network</span>
            <p style={s.statValue("#f59e0b")}>
              {network} <span style={{ fontSize: "13px" }}>MB/s</span>
            </p>
            <p style={s.statSub}>total</p>
          </div>
        </div>

        {/* CPU + RAM Charts */}
        <div style={s.chartsGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>CPU Usage</span>
              <span style={{ color: "#3b82f6", fontSize: "11px" }}>LIVE</span>
            </div>
            <div style={s.chartWrap}>
              <Line
                data={makeDataset("CPU %", usage.map(u => u.cpu), "#3b82f6")}
                options={chartOptions}
              />
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>RAM Usage</span>
              <span style={{ color: "#a855f7", fontSize: "11px" }}>LIVE</span>
            </div>
            <div style={s.chartWrap}>
              <Line
                data={makeDataset("RAM %", usage.map(u => u.ram), "#a855f7")}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Network Charts */}
        <div style={s.chartsGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>Download Speed</span>
              <span style={{ color: "#06b6d4", fontSize: "11px" }}>MB/s</span>
            </div>
            <div style={s.chartWrap}>
              <Line
                data={makeDataset("Download", usage.map(u => u.download), "#06b6d4")}
                options={networkChartOptions}
              />
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>Upload Speed</span>
              <span style={{ color: "#10b981", fontSize: "11px" }}>MB/s</span>
            </div>
            <div style={s.chartWrap}>
              <Line
                data={makeDataset("Upload", usage.map(u => u.upload), "#10b981")}
                options={networkChartOptions}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}