import screenshot from "screenshot-desktop";
import fs from "fs";

export async function takeScreenshot(userId) {

    if (!fs.existsSync("screenshot")) {
        fs.mkdirSync("screenshot");
    }

    const img = await screenshot();
    const path = `screenshot/${userId}-${Date.now()}.png`;

    fs.writeFileSync(path, img);

    return path;
}