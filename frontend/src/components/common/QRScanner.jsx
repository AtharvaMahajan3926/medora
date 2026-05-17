import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const [scannerActive, setScannerActive] = useState(true);

  useEffect(() => {
    let html5QrcodeScanner;
    
    if (scannerActive) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          // Pause scanning after successful scan to prevent multiple triggers
          setScannerActive(false);
          html5QrcodeScanner.clear();
          if (onScanSuccess) onScanSuccess(decodedText);
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );
    }

    return () => {
      if (html5QrcodeScanner && scannerActive) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [scannerActive, onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-md mx-auto">
      {scannerActive ? (
        <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-2 border-blue-200 shadow-sm bg-black"></div>
      ) : (
        <div className="p-8 text-center bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 font-medium">Scan processed successfully!</p>
          <button 
            onClick={() => setScannerActive(true)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Scan another code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
