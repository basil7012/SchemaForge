import { ImageResponse } from 'next/og';

export const alt = 'SchemaForge — Free SQL Schema & Code Generator';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#09090b',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top-right glow orb */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Bottom-left glow orb */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-80px',
            width: '360px',
            height: '360px',
            background:
              'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 32px rgba(99,102,241,0.4)',
            }}
          >
            {/* Database icon via SVG */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #818cf8, #67e8f9)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            SchemaForge
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '72px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#f4f4f5',
            }}
          >
            SQL Schema to
          </h1>
          <h1
            style={{
              margin: 0,
              fontSize: '72px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              background: 'linear-gradient(90deg, #818cf8, #a78bfa, #67e8f9)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Code &amp; Data
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            margin: 0,
            fontSize: '26px',
            color: '#a1a1aa',
            lineHeight: 1.5,
            maxWidth: '720px',
            fontWeight: 400,
          }}
        >
          100% Client-Side SQL Schema &amp; Code Generator.
          Zero Server Tracking.
        </p>

        {/* Privacy badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '40px',
            padding: '10px 20px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '999px',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            style={{
              fontSize: '18px',
              color: '#34d399',
              fontWeight: 600,
              letterSpacing: '0.2px',
            }}
          >
            C# · TypeScript · Mock JSON · SQL Inserts
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '20px',
            color: '#52525b',
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          schemaforge.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
