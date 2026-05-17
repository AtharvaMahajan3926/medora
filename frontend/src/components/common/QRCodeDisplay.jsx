import React from 'react';
import QRCode from 'react-qr-code';

const QRCodeDisplay = ({ value, label = "Show this to the delivery agent or pharmacist" }) => {
  // Fix for Vite/ESM default import sometimes returning an object
  const QRCodeComponent = QRCode.default || QRCode;

  return (
    <div
      className="qr-display-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.25rem 2rem',
        background: 'var(--clr-surface)', // Dynamic theme background card
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--clr-border)', // Dynamic theme border
        boxShadow: 'var(--shadow-md)', // Theme-compliant ambient shadow
        maxWidth: '340px',
        margin: '0.75rem auto',
        position: 'relative'
      }}
    >
      {/* Scoped CSS to map colors dynamically based on active light/dark theme */}
      <style>{`
        .qr-display-card p.qr-desc {
          color: var(--clr-text) !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
          margin: 1.25rem 0 0.5rem 0 !important;
          text-align: center !important;
        }
        .qr-display-token {
          color: var(--clr-text-muted) !important;
          background: var(--clr-background) !important;
          border: 1px solid var(--clr-border) !important;
          font-family: monospace !important;
          font-size: 0.75rem !important;
          padding: 0.5rem 1rem !important;
          border-radius: var(--radius-md) !important;
          word-break: break-all !important;
          text-align: center !important;
          width: 100% !important;
          margin-top: 0.5rem !important;
        }
      `}</style>

      {/* Solid white box reserved specifically for QR barcode to guarantee 100% camera contrast compliance */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <QRCodeComponent value={value || ''} size={180} />
      </div>

      <p className="qr-desc">
        {label}
      </p>

      <div className="qr-display-token">
        {value}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
