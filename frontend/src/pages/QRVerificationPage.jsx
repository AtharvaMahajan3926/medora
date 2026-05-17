import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import QRScanner from '../components/common/QRScanner';

const QRVerificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScanSuccess = async (decodedText) => {
    setLoading(true);
    try {
      const { data } = await api.post('/qr/verify', { qr_code: decodedText });
      setResult(data);
      toast.success('QR Code verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid QR Code or unauthorized');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Verify Customer QR</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          
          {!result ? (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Scan QR Code</h2>
              <p className="text-sm text-gray-500 mb-6">Ask the customer to show their order QR code and scan it here to complete the transaction.</p>
              
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <QRScanner onScanSuccess={handleScanSuccess} />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-8 border border-green-200 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
              <p className="text-gray-600 mb-6">{result.detail}</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 border border-gray-100 mb-8">
                <p className="text-sm"><span className="text-gray-500">Customer:</span> <span className="font-semibold float-right">{result.customer_name}</span></p>
                <p className="text-sm"><span className="text-gray-500">Amount Collected:</span> <span className="font-semibold float-right text-green-700">${result.total_amount?.toFixed(2)}</span></p>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-md"
              >
                Back to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QRVerificationPage;
