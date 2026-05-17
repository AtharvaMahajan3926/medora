import React from 'react';
import QRCode from 'react-qr-code';

const QRCodeDisplay = ({ value, label = "Show this to the delivery agent or pharmacist" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-100">
        <QRCode value={value} size={200} />
      </div>
      <p className="mt-4 text-sm text-gray-600 text-center max-w-xs">{label}</p>
      <div className="mt-2 text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-500">
        {value}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
