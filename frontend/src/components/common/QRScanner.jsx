import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const [scannerActive, setScannerActive] = useState(true);
  const successRef = useRef(onScanSuccess);
  const failureRef = useRef(onScanFailure);

  useEffect(() => {
    successRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    failureRef.current = onScanFailure;
  }, [onScanFailure]);

  useEffect(() => {
    let html5QrcodeScanner;
    
    if (scannerActive) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      );
      
      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          // Pause scanning after successful scan
          setScannerActive(false);
          if (successRef.current) successRef.current(decodedText);
        },
        (error) => {
          if (failureRef.current) failureRef.current(error);
        }
      );
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [scannerActive]);

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* Scope overriding styles for library-injected elements */}
      <style>{`
        #qr-reader {
          border: 1px solid var(--clr-border) !important;
          border-radius: var(--radius-xl) !important;
          background: var(--clr-surface) !important;
          padding: 1.5rem !important;
        }
        #qr-reader__scan_region {
          background: #000 !important;
          border-radius: var(--radius-lg) !important;
          overflow: hidden !important;
        }
        #qr-reader button {
          background: var(--clr-primary) !important;
          color: #fff !important;
          border: none !important;
          padding: 0.6rem 1.5rem !important;
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          border-radius: var(--radius-md) !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          margin: 0.75rem auto !important;
          display: inline-block !important;
          box-shadow: var(--button-glow) !important;
        }
        #qr-reader button:hover {
          background: var(--clr-primary-light) !important;
          transform: translateY(-1px) !important;
        }
        #qr-reader select {
          background: var(--clr-background) !important;
          color: var(--clr-text) !important;
          border: 1px solid var(--clr-border) !important;
          padding: 0.5rem 1rem !important;
          border-radius: var(--radius-md) !important;
          font-size: 0.85rem !important;
          outline: none !important;
          margin: 0.5rem auto !important;
          display: block !important;
          max-width: 100% !important;
        }
        #qr-reader a {
          color: var(--clr-primary) !important;
          font-size: 0.8rem !important;
          text-decoration: none !important;
          font-weight: 500 !important;
        }
        #qr-reader__dashboard_section_csr {
          margin-top: 1rem !important;
        }
      `}</style>

      {scannerActive ? (
        <div 
          id="qr-reader" 
          style={{ 
            width: '100%', 
            overflow: 'hidden', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--clr-border)', 
            boxShadow: 'var(--shadow-md)', 
            background: 'var(--clr-surface)' 
          }}
        ></div>
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'var(--clr-success-bg)', 
          border: '1px solid var(--clr-success-border)', 
          borderRadius: 'var(--radius-xl)' 
        }}>
          <p style={{ color: 'var(--clr-success)', fontWeight: '600', margin: 0 }}>Scan processed successfully!</p>
          <button 
            onClick={() => setScannerActive(true)}
            className="btn btn-primary btn-sm"
            style={{ 
              marginTop: '1.25rem',
              boxShadow: 'var(--button-glow)'
            }}
          >
            Scan another code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
