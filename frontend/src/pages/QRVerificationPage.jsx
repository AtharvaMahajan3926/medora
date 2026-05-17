import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Keyboard, Camera } from 'lucide-react';
import QRScanner from '../components/common/QRScanner';

const QRVerificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const hasScannedRef = useRef(false);

  const handleScanSuccess = async (decodedText) => {
    if (!decodedText || !decodedText.trim()) {
      toast.error('Please enter a valid code');
      return;
    }
    if (hasScannedRef.current) {
      return; // Ignore duplicate concurrent scans
    }
    hasScannedRef.current = true;
    setLoading(true);
    try {
      const data = await api.post('/qr/verify', { qr_code: decodedText.trim() });
      setResult(data);
      toast.success('QR Code verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid QR Code or unauthorized');
      // Reset gatekeeper ref on error so they can retry scanning
      hasScannedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', color: 'var(--clr-text)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        background: 'var(--clr-surface)', 
        borderBottom: '1px solid var(--clr-border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        padding: '0.75rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.5rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--clr-text-muted)',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--clr-surface-alt)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Verify Customer QR</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          
          {!result ? (
            <div style={{ 
              background: 'var(--clr-surface)', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-md)', 
              padding: '2rem', 
              border: '1px solid var(--clr-border)', 
              textAlign: 'center' 
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Scan QR Code</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>
                Ask the customer to show their order QR code and scan it here to complete the transaction.
              </p>
              
              {loading ? (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="spin" style={{ display: 'inline-block', fontSize: '2rem' }}>⏳</span>
                </div>
              ) : showManualInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                  <input 
                    type="text" 
                    placeholder="Enter QR Code / Token..." 
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--clr-border)',
                      background: 'var(--clr-bg)',
                      color: 'var(--clr-text)',
                      width: '100%',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <button 
                    onClick={() => handleScanSuccess(manualCode)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                  >
                    Verify Code
                  </button>
                  <button 
                    onClick={() => setShowManualInput(false)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--clr-primary)', 
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      fontWeight: '600'
                    }}
                  >
                    <Camera size={16} /> Switch to Camera Scanner
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <QRScanner onScanSuccess={handleScanSuccess} />
                  <button 
                    onClick={() => setShowManualInput(true)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--clr-primary)', 
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <Keyboard size={16} /> Can't scan? Enter code manually
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              background: 'var(--clr-surface)', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-md)', 
              padding: '2.5rem', 
              border: '1px solid var(--clr-success-border)', 
              textAlign: 'center', 
              position: 'relative', 
              overflow: 'hidden' 
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--clr-success)' }}></div>
              <div style={{ 
                margin: '0 auto 1.5rem auto', 
                width: '5rem', 
                height: '5rem', 
                background: 'var(--clr-success-bg)', 
                color: 'var(--clr-success)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircle size={40} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--clr-success)', marginBottom: '0.5rem' }}>Success!</h2>
              <p style={{ color: 'var(--clr-text-muted)', marginBottom: '1.5rem' }}>{result.detail}</p>
              
              <div style={{ 
                background: 'var(--clr-surface-alt)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                textAlign: 'left', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                border: '1px solid var(--clr-border)', 
                marginBottom: '2rem' 
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Customer:</span> 
                  <span style={{ fontWeight: '600' }}>{result.customer_name}</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Amount Collected:</span> 
                  <span style={{ fontWeight: 'bold', color: 'var(--clr-success)' }}>₹{result.total_amount?.toFixed(2)}</span>
                </p>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
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
