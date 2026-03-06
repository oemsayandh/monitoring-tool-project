import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "zerotestanomaly@gmail.com",
        pass: "jzit qenj bwjm imcp"
    }
});

export async function sendAlertEmail(to, subject, text, attachmentPath = null) {

    const mailOptions = {
        from: "zerotestanomaly@gmail.com",
        to,
        subject,
        text,
    };

    if (attachmentPath) {
        mailOptions.attachments = [
            {
                filename: "screenshot.png",
                path: attachmentPath,
            }
        ];
    }

    await transporter.sendMail(mailOptions);
}

