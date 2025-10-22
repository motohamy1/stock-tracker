import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from './templates';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: 'StockJar',
        to: email,
        subject: 'Welcome to Stockjar - your stock market toolkit is ready!',
        text: 'Thanks for being with StockJar community',
        html: htmlTemplate,
    }
    await transporter.sendMail(mailOptions)
}

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: { email: string; date: string; newsContent: string }) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: 'Signalist News',
        to: email,
        subject: `Market News Summary Today - ${date}`,
        text: 'Today\'s market news from Signalist',
        html: htmlTemplate,
    }
    await transporter.sendMail(mailOptions)
}

