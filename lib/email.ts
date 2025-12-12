
import { Resend } from 'resend';
import { ReactNode } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplate {
    subject: string;
    react: ReactNode;
}

export const sendEmail = async (to: string, template: EmailTemplate) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email will not be sent.");
        // In development, we can log to console
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Email would be sent to ${to} with subject "${template.subject}"`);
            return { id: 'mock-id' };
        }
        throw new Error("RESEND_API_KEY is missing in environment variables.");
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
            to,
            subject: template.subject,
            react: template.react as React.ReactElement,
        });

        if (error) {
            console.error("Resend Error:", error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error("Failed to send email:", err);
        throw err;
    }
};
