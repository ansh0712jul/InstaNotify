// cronJobs.js

import nodemailer from "nodemailer";
import cron from "node-cron";
import axios from "axios";
import { website } from "../models/website.models.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

const isSiteActive = async (url) => {
    if (!url) return false;

    const res = await axios.get(url).catch((err) => void err);
    return res && res.status === 200;
};

const monitorWebsites = () => {
    cron.schedule("*/1 * * * *", async () => {
        const allWebsites = await website.find({}).populate({
            path: "userId",
            select: ["name", "email"],
        });
        if (!allWebsites.length) return;

        for (let web of allWebsites) {
            const url = web.url;
            const isActive = await isSiteActive(url);

            // Update website status
            await website.updateOne(
                { _id: web._id },
                { isActive }
            ).exec();

            // Send notification if the site went down
            if (!isActive && web.isActive) {
                await transport.sendMail({
                    from: process.env.GMAIL_USER,
                    to: web.userId.email,
                    subject: "Your website is down",
                    html: `<b>${web.url}</b> is currently down as of ${new Date().toLocaleString("en-IN")}.`,
                });
            }
        }
    });
};

export default monitorWebsites;
