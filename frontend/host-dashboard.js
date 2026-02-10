const API = "http://localhost:5000";
const HOST_CODE = "ROOM123"; // demo host code

let cpuChart;

async function loadDashboard() {
    let res = await fetch(`${API}/dashboard/host/${HOST_CODE}`);
    let result = await res.json();

    let users = result.data;
    if (!users) return;

    let labels = [];
    let cpuData = [];

    let highestUser = null;
    let highestCPU = 0;

    for (let userId in users) {
        labels.push(userId);
        cpuData.push(users[userId].cpu);

        if (users[userId].cpu > highestCPU) {
            highestCPU = users[userId].cpu;
            highestUser = userId;
        }

        if (users[userId].cpu > 70 || users[userId].ram > 80) {
            document.getElementById("alertBox").classList.remove("hidden");
        }
    }

    document.getElementById("topUser").innerText =
        highestUser ? `${highestUser} (${highestCPU}%)` : "No data";

    drawChart(labels, cpuData);
}

function drawChart(labels, data) {
    if (cpuChart) cpuChart.destroy();

    cpuChart = new Chart(document.getElementById("cpuChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "CPU Usage %",
                data
            }]
        }
    });
}

function saveParental() {
    let enabled = document.getElementById("parentalToggle").checked;
    let email = document.getElementById("alertEmail").value;

    localStorage.setItem("parentalEnabled", enabled);
    localStorage.setItem("parentalEmail", email);

    alert("Parental control saved");
}

// Auto refresh every 30 seconds
setInterval(loadDashboard, 30000);
loadDashboard();
