
import * as React from 'react';

interface MagicLinkEmailProps {
    url: string;
}

export const MagicLinkEmail = ({ url }: MagicLinkEmailProps) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Login to SaaS</h2>
        <p>Click the link below to sign in securely. This link expires in 15 minutes.</p>
        <a
            href={url}
            style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#0070f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}
        >
            Sign In
        </a>
        <p style={{ marginTop: '20px', color: '#666', fontSize: '12px' }}>
            Or copy and paste this URL into your browser:<br />
            {url}
        </p>
    </div>
);

export default MagicLinkEmail;
