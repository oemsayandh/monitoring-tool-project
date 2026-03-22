import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendAlertEmail(to, subject, text, attachmentPath = null) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    if (attachmentPath) {
        mailOptions.attachments = [{
            filename: "screenshot.png",
            path: attachmentPath,
        }];
    }

    await transporter.sendMail(mailOptions);
}


