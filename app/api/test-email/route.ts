
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import * as React from 'react';

export async function GET() {
    try {
        const to = 'delivered@resend.dev';

        // Avoid JSX issues by using createElement directly
        // This removes ambiguity with the '<' operator in strict environments or misconfigured editors
        const emailElement = React.createElement('div', { style: { fontFamily: 'sans-serif', padding: '20px' } },
            React.createElement('h1', null, 'It works! 🚀'),
            React.createElement('p', null, 'This is a test email to verify the Resend integration.'),
            React.createElement('hr', null),
            React.createElement('p', { style: { color: '#888', fontSize: '12px' } },
                `Sent from your local environment at: ${new Date().toLocaleString()}`
            )
        );

        const result = await sendEmail(to, {
            subject: 'Test Email from Localhost',
            react: emailElement
        });

        return NextResponse.json({
            success: true,
            message: 'Email processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Email Test Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
