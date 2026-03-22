import os from "os";
import { takeScreenshot } from "./screenshot.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

let isSpiking = false; // tracks spike state

async function monitorSystem() {

    const cpu = Math.random() * 100; // replace later with real CPU
    const ram = (1 - os.freemem() / os.totalmem()) * 100;

    const isHigh = cpu > 70 || ram > 80;

    console.log("CPU:", cpu.toFixed(2), "RAM:", ram.toFixed(2));

    //  Spike Started
    if (isHigh && !isSpiking) {
        console.log(" Spike detected");
        isSpiking = true;
        await sendAlert(cpu, ram);
    }

    //  Still Spiking
    else if (isHigh && isSpiking) {
        console.log(" Spike continues");
        await sendAlert(cpu, ram);
    }

    //  Spike Ended
    else if (!isHigh && isSpiking) {
        console.log(" Spike ended");
        isSpiking = false;
    }
}

async function sendAlert(cpu, ram) {

    const screenshotPath = await takeScreenshot("user1");

    const form = new FormData();

    form.append("userId", "user1");
    form.append("hostCode", "ROOM123");
    form.append("cpu", cpu);
    form.append("ram", ram);
    form.append("network", 10);
    form.append("uptime", os.uptime());
    form.append("parentEmail", "sindhuvb1@gmail.com");
    form.append("screenshot", fs.createReadStream(screenshotPath));

    await axios.post("http://localhost:5000/system/upload", form, {
        headers: form.getHeaders(),
    });

    fs.unlinkSync(screenshotPath);

    console.log(" Email sent");
}

// Run every 20 seconds
setInterval(monitorSystem, 20000);