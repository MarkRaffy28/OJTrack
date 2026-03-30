import QRCode from "qrcode";
import { useEffect, useState } from "react";
import API from "../api/api";

function Qr() {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const response = await API.get("/offices/qr/1");
        const qrValue = JSON.stringify(response.data);
        const url = await QRCode.toDataURL(qrValue, {
          width: 280,
          margin: 2,
          color: { dark: "#0f172a", light: "#f8fafc" },
        });
        setQrUrl(url);
        setLastUpdated(new Date());
        setCountdown(60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generateQr();
    const interval = setInterval(generateQr, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const circumference = 2 * Math.PI * 20;
  const progress = ((60 - countdown) / 60) * circumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

        .qr-root {
          min-height: 100vh;
          background: #060b14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          position: relative;
          overflow: hidden;
        }

        .qr-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(56, 189, 248, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .qr-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .qr-card {
          position: relative;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 24px;
          padding: 40px 36px;
          width: 380px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(56, 189, 248, 0.05),
            0 40px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .qr-header {
          margin-bottom: 28px;
        }

        .qr-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 100px;
          padding: 4px 12px;
          margin-bottom: 16px;
        }

        .qr-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .qr-badge-text {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #38bdf8;
          font-weight: 500;
        }

        .qr-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .qr-subtitle {
          font-size: 12px;
          color: #475569;
          letter-spacing: 0.05em;
        }

        .qr-frame {
          position: relative;
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .qr-frame::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          background: linear-gradient(135deg, rgba(56,189,248,0.3), transparent 50%, rgba(99,102,241,0.2));
          z-index: 0;
        }

        .qr-frame-inner {
          position: relative;
          z-index: 1;
          background: #f8fafc;
          border-radius: 12px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-image {
          width: 240px;
          height: 240px;
          display: block;
          border-radius: 4px;
        }

        .qr-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: #38bdf8;
          border-style: solid;
          z-index: 2;
        }
        .qr-corner.tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
        .qr-corner.tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
        .qr-corner.bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
        .qr-corner.br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }

        .qr-skeleton {
          width: 240px;
          height: 240px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .qr-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .qr-office {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .qr-office-label {
          font-size: 10px;
          color: #334155;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .qr-office-name {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }

        .qr-timer {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qr-timer-label {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .qr-timer-text {
          font-size: 10px;
          color: #334155;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .qr-timer-count {
          font-size: 15px;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .qr-ring {
          transform: rotate(-90deg);
          overflow: visible;
        }

        .qr-ring-track {
          fill: none;
          stroke: rgba(148, 163, 184, 0.1);
          stroke-width: 2.5;
        }

        .qr-ring-progress {
          fill: none;
          stroke: #38bdf8;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference - progress};
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.5));
        }

        .qr-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,163,184,0.08), transparent);
          margin: 24px 0;
        }
      `}</style>

      <div className="qr-root">
        <div className="qr-grid" />
        <div className="qr-card">
          <div className="qr-header">
            <div className="qr-badge">
              <div className="qr-badge-dot" />
              <span className="qr-badge-text">Live Access Code</span>
            </div>
            <h1 className="qr-title">Office Check-In</h1>
            <p className="qr-subtitle">Scan to register your attendance</p>
          </div>

          <div className="qr-frame">
            <div className="qr-corner tl" />
            <div className="qr-corner tr" />
            <div className="qr-corner bl" />
            <div className="qr-corner br" />
            <div className="qr-frame-inner">
              {loading ? (
                <div className="qr-skeleton" />
              ) : (
                <img className="qr-image" src={qrUrl} alt="Office QR Code" />
              )}
            </div>
          </div>

          <div className="qr-divider" />

          <div className="qr-footer">
            <div className="qr-office">
              <span className="qr-office-label">Location</span>
              <span className="qr-office-name">Office #1</span>
            </div>

            <div className="qr-timer">
              <div className="qr-timer-label">
                <span className="qr-timer-text">Refreshes in</span>
                <span className="qr-timer-count">
                  00:{String(countdown).padStart(2, "0")}
                </span>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" className="qr-ring">
                <circle className="qr-ring-track" cx="24" cy="24" r="20" />
                <circle className="qr-ring-progress" cx="24" cy="24" r="20" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Qr;
