import { useEffect, useState } from "react";
import { getHostDashboard } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend
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
  }
};

export default function HostDashboard() {

  const [labels, setLabels] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [ramHistory, setRamHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [topUser, setTopUser] = useState({ name: "N/A", cpu: 0, ram: 0 });
  const [alert, setAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--");
  const [parentalMode, setParentalMode] = useState(false);
  const [parentalLoading, setParentalLoading] = useState(false);
  const [parentalMsg, setParentalMsg] = useState("");
  const [usernames, setUsernames] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roomCode = user.hostCode || "NO ROOM";

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
  }

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadRoomStatus() {
      try {
        const res = await fetch(
          `http://localhost:5000/host/room-members/${roomCode}`,
          { headers: authHeaders() }
        );
        const data = await res.json();
        if (data.success) {
          setParentalMode(data.parentalMode);
        }
      } catch (err) {
        console.error("Could not load room status");
      }
    }
    if (roomCode !== "NO ROOM") loadRoomStatus();
  }, [roomCode]);

  async function toggleParentalMode() {
    setParentalLoading(true);
    setParentalMsg("");
    try {
      const res = await fetch("http://localhost:5000/host/parental-mode", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ roomCode, enabled: !parentalMode })
      });
      const data = await res.json();
      if (data.success) {
        setParentalMode(!parentalMode);
        setParentalMsg(!parentalMode
          ? "Parental mode enabled — email + screenshot alerts active"
          : "Parental mode disabled"
        );
        setTimeout(() => setParentalMsg(""), 3000);
      }
    } catch (err) {
      setParentalMsg("Failed to update parental mode");
    } finally {
      setParentalLoading(false);
    }
  }

  async function loadDashboard() {
    const data = await getHostDashboard(roomCode);
    const users = data.data;
    if (!users) return;

    let l = [], cpu = [], ram = [];
    let highest = { name: "N/A", cpu: 0, ram: 0 };
    let critical = false;
    let totalCPU = 0, totalRAM = 0, count = 0;
    let names = {};

    for (let u in users) {
      const c = Math.round(users[u].cpu);
      const r = Math.round(users[u].ram);

      // Store username mapping
      names[u] = users[u].username || u;

      l.push(u);
      cpu.push(c);
      ram.push(r);
      totalCPU += c;
      totalRAM += r;
      count++;

      // Use username for top consumer display
      if (c > highest.cpu) {
        highest = {
          name: users[u].username || u,
          cpu: c,
          ram: r
        };
      }

      // Consistent threshold — same as user dashboard
      if (c > 70 || r > 80) critical = true;
    }

    const avgCPU = count ? Math.round(totalCPU / count) : 0;
    const avgRAM = count ? Math.round(totalRAM / count) : 0;
    const now = new Date().toLocaleTimeString();

    setTimeLabels(prev => [...prev.slice(-9), now]);
    setCpuHistory(prev => [...prev.slice(-9), avgCPU]);
    setRamHistory(prev => [...prev.slice(-9), avgRAM]);
    setLabels(l);
    setCpuData(cpu);
    setRamData(ram);
    setTopUser(highest);
    setAlert(critical);
    setLastUpdate(now);
    setUsernames(names);
  }

  const handleReset = () => {
    setLabels([]);
    setCpuData([]);
    setRamData([]);
    setCpuHistory([]);
    setRamHistory([]);
    setTimeLabels([]);
    setTopUser({ name: "N/A", cpu: 0, ram: 0 });
    setAlert(false);
    setUsernames({});
  };

  const createBarData = (label, dataPoints, color) => ({
    labels: labels.map(u => usernames[u] || u),
    datasets: [{
      label,
      data: dataPoints,
      backgroundColor: dataPoints.map(v => v > 70 ? "#ef4444" : color),
      borderRadius: 4,
      borderSkipped: false,
    }]
  });

  const createLineData = (label, dataPoints, color) => ({
    labels: timeLabels,
    datasets: [{
      label,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + "22",
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 4,
    }]
  });

  const avgCPU = cpuData.length
    ? Math.round(cpuData.reduce((a, b) => a + b, 0) / cpuData.length) : 0;
  const avgRAM = ramData.length
    ? Math.round(ramData.reduce((a, b) => a + b, 0) / ramData.length) : 0;

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
      alignItems: "center",
    },
    topbarLeft: { display: "flex", alignItems: "center", gap: "14px" },
    title: { fontSize: "18px", fontWeight: "600", color: "#f1f5f9", margin: 0 },
    roomBadge: {
      background: "#1e293b",
      border: "1px solid #334155",
      color: "#94a3b8",
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontFamily: "monospace"
    },
    statusDot: {
      width: "8px", height: "8px",
      borderRadius: "50%",
      background: alert ? "#ef4444" : "#22c55e",
      boxShadow: alert ? "0 0 8px #ef4444" : "0 0 8px #22c55e",
      display: "inline-block"
    },
    statusText: {
      fontSize: "12px",
      color: alert ? "#ef4444" : "#22c55e",
      fontWeight: "500"
    },
    topbarRight: { display: "flex", alignItems: "center", gap: "12px" },
    updateText: { fontSize: "11px", color: "#475569" },
    resetBtn: {
      background: "transparent",
      border: "1px solid #334155",
      color: "#94a3b8",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      width: "auto",
      margin: 0,
    },
    alertBanner: {
      background: "#ef444420",
      border: "1px solid #ef4444",
      color: "#ef4444",
      padding: "7px 16px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
    },
    parentalCard: {
      background: parentalMode ? "#f59e0b10" : "#1e293b",
      border: `1px solid ${parentalMode ? "#f59e0b" : "#334155"}`,
      borderRadius: "10px",
      padding: "16px 20px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px"
    },
    parentalLeft: { display: "flex", alignItems: "center", gap: "14px" },
    parentalIcon: {
      width: "38px", height: "38px",
      background: parentalMode ? "#f59e0b20" : "#1e293b",
      border: `1px solid ${parentalMode ? "#f59e0b" : "#334155"}`,
      borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "18px"
    },
    parentalTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: parentalMode ? "#f59e0b" : "#f1f5f9",
      marginBottom: "2px"
    },
    parentalDesc: {
      fontSize: "12px",
      color: "#64748b"
    },
    parentalRight: { display: "flex", alignItems: "center", gap: "12px" },
    parentalMsg: {
      fontSize: "12px",
      color: parentalMode ? "#f59e0b" : "#64748b",
      fontStyle: "italic"
    },
    toggleWrap: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: parentalLoading ? "not-allowed" : "pointer",
      opacity: parentalLoading ? 0.6 : 1
    },
    toggleTrack: {
      width: "44px", height: "24px",
      background: parentalMode ? "#f59e0b" : "#334155",
      borderRadius: "99px",
      position: "relative",
      transition: "background 0.2s",
      flexShrink: 0
    },
    toggleThumb: {
      width: "18px", height: "18px",
      background: "#fff",
      borderRadius: "50%",
      position: "absolute",
      top: "3px",
      left: parentalMode ? "23px" : "3px",
      transition: "left 0.2s"
    },
    toggleLabel: {
      fontSize: "13px",
      fontWeight: "500",
      color: parentalMode ? "#f59e0b" : "#94a3b8"
    },
    body: { padding: "24px 28px" },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "16px",
      marginBottom: "24px"
    },
    statCard: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "16px 20px",
    },
    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontWeight: "500",
      marginBottom: "8px",
      display: "block"
    },
    statValue: { fontSize: "26px", fontWeight: "600", color: "#f1f5f9", margin: 0 },
    statSub: { fontSize: "11px", color: "#475569", marginTop: "4px" },
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
    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "20px"
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      fontSize: "11px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid #334155"
    },
    td: {
      padding: "10px 12px",
      fontSize: "13px",
      color: "#e2e8f0",
      borderBottom: "1px solid #1e293b"
    },
    activityList: { listStyle: "none", padding: 0, margin: 0 },
    activityItem: {
      padding: "10px 0",
      borderBottom: "1px solid #1e293b",
      fontSize: "12px",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  return (
    <div style={s.wrap}>

      {/* Top Bar */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <h1 style={s.title}>Zero Test Monitor</h1>
          <span style={s.roomBadge}>ROOM: {roomCode}</span>
          <span style={s.statusDot}></span>
          <span style={s.statusText}>{alert ? "CRITICAL" : "STABLE"}</span>
        </div>
        <div style={s.topbarRight}>
          <span style={s.updateText}>Updated {lastUpdate}</span>
          <button
            style={{ ...s.resetBtn, color: "#a78bfa", borderColor: "#534AB7" }}
            onClick={() => navigate("/create-room")}
          >
            + Create Room
          </button>
          <button style={s.resetBtn} onClick={handleReset}>Reset</button>
          {alert && <div style={s.alertBanner}>⚠ HIGH USAGE DETECTED</div>}
        </div>
      </div>

      <div style={s.body}>

        {/* Parental Mode Card */}
        <div style={s.parentalCard}>
          <div style={s.parentalLeft}>
            <div style={s.parentalIcon}>👨‍👩‍👧</div>
            <div>
              <div style={s.parentalTitle}>
                Parental Mode {parentalMode ? "— ACTIVE" : ""}
              </div>
              <div style={s.parentalDesc}>
                {parentalMode
                  ? "Email alerts + screenshots enabled when anomaly detected"
                  : "Enable to receive email alerts and screenshots when a child's usage spikes"
                }
              </div>
            </div>
          </div>
          <div style={s.parentalRight}>
            {parentalMsg && (
              <span style={s.parentalMsg}>{parentalMsg}</span>
            )}
            <div style={s.toggleWrap} onClick={!parentalLoading ? toggleParentalMode : undefined}>
              <div style={s.toggleTrack}>
                <div style={s.toggleThumb}></div>
              </div>
              <span style={s.toggleLabel}>
                {parentalLoading ? "Updating..." : parentalMode ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={s.statGrid}>
          <div style={s.statCard}>
            <span style={s.statLabel}>Total Users</span>
            <p style={s.statValue}>{labels.length}</p>
            <p style={s.statSub}>in room</p>
          </div>
          <div style={{ ...s.statCard, borderTop: "2px solid #3b82f6" }}>
            <span style={s.statLabel}>Avg CPU</span>
            <p style={{ ...s.statValue, color: "#3b82f6" }}>{avgCPU}%</p>
            <p style={s.statSub}>across all users</p>
          </div>
          <div style={{ ...s.statCard, borderTop: "2px solid #a855f7" }}>
            <span style={s.statLabel}>Avg RAM</span>
            <p style={{ ...s.statValue, color: "#a855f7" }}>{avgRAM}%</p>
            <p style={s.statSub}>across all users</p>
          </div>
          <div style={{ ...s.statCard, borderTop: "2px solid #f59e0b" }}>
            <span style={s.statLabel}>Top Consumer</span>
            <p style={{ ...s.statValue, fontSize: "18px", color: "#f59e0b" }}>{topUser.name}</p>
            <p style={s.statSub}>CPU {topUser.cpu}% · RAM {topUser.ram}%</p>
          </div>
          <div style={{ ...s.statCard, borderTop: "2px solid #10b981" }}>
            <span style={s.statLabel}>Parental Mode</span>
            <p style={{ ...s.statValue, fontSize: "18px", color: parentalMode ? "#f59e0b" : "#475569" }}>
              {parentalMode ? "ON" : "OFF"}
            </p>
            <p style={s.statSub}>email + screenshot</p>
          </div>
        </div>

        {/* Bar Charts */}
        <div style={s.chartsGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>CPU Usage per User</span>
              <span style={{ color: "#3b82f6", fontSize: "11px" }}>LIVE</span>
            </div>
            <div style={s.chartWrap}>
              <Bar data={createBarData("CPU", cpuData, "#3b82f6")} options={chartOptions} />
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>RAM Usage per User</span>
              <span style={{ color: "#a855f7", fontSize: "11px" }}>LIVE</span>
            </div>
            <div style={s.chartWrap}>
              <Bar data={createBarData("RAM", ramData, "#a855f7")} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Line Charts */}
        <div style={s.chartsGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>CPU History (avg)</span>
              <span style={{ color: "#06b6d4", fontSize: "11px" }}>10 MIN</span>
            </div>
            <div style={s.chartWrap}>
              <Line data={createLineData("CPU Avg", cpuHistory, "#06b6d4")} options={chartOptions} />
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <span>RAM History (avg)</span>
              <span style={{ color: "#ec4899", fontSize: "11px" }}>10 MIN</span>
            </div>
            <div style={s.chartWrap}>
              <Line data={createLineData("RAM Avg", ramHistory, "#ec4899")} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Bottom — Users Table + Activity */}
        <div style={s.bottomGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><span>Active Users</span></div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>User</th>
                  <th style={s.th}>CPU</th>
                  <th style={s.th}>RAM</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {labels.length === 0 && (
                  <tr>
                    <td style={{ ...s.td, color: "#475569" }} colSpan={4}>
                      Waiting for users...
                    </td>
                  </tr>
                )}
                {labels.map((u, i) => (
                  <tr key={u}>
                    <td style={s.td}>
                      {usernames[u] || u}
                    </td>
                    <td style={{
                      ...s.td,
                      color: cpuData[i] > 70 ? "#ef4444" : "#3b82f6",
                      fontWeight: "500"
                    }}>
                      {cpuData[i]}%
                    </td>
                    <td style={{
                      ...s.td,
                      color: ramData[i] > 80 ? "#ef4444" : "#a855f7",
                      fontWeight: "500"
                    }}>
                      {ramData[i]}%
                    </td>
                    <td style={s.td}>
                      <span style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "99px",
                        background: (cpuData[i] > 70 || ramData[i] > 80)
                          ? "#ef444420" : "#22c55e20",
                        color: (cpuData[i] > 70 || ramData[i] > 80)
                          ? "#ef4444" : "#22c55e",
                        border: `1px solid ${(cpuData[i] > 70 || ramData[i] > 80)
                          ? "#ef4444" : "#22c55e"}`
                      }}>
                        {(cpuData[i] > 70 || ramData[i] > 80) ? "Critical" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity Feed */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><span>Activity Feed</span></div>
            <ul style={s.activityList}>
              <li style={s.activityItem}>
                <span style={{ color: "#22c55e" }}>●</span>
                Monitoring room {roomCode}
              </li>
              <li style={s.activityItem}>
                <span style={{ color: "#3b82f6" }}>●</span>
                Tracking {labels.length} user{labels.length !== 1 ? "s" : ""}
              </li>
              <li style={s.activityItem}>
                <span style={{ color: "#a855f7" }}>●</span>
                Live updates every 2s
              </li>
              <li style={s.activityItem}>
                <span style={{ color: "#f59e0b" }}>●</span>
                Last update: {lastUpdate}
              </li>
              {parentalMode && (
                <li style={s.activityItem}>
                  <span style={{ color: "#f59e0b" }}>●</span>
                  Parental mode active
                </li>
              )}
              {alert && (
                <li style={{ ...s.activityItem, color: "#ef4444" }}>
                  <span>●</span>
                  ⚠ High usage — {topUser.name}
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}