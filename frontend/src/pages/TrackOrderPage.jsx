import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Phone } from 'lucide-react';
import TrackingTimeline from '../components/common/TrackingTimeline';
import QRCodeDisplay from '../components/common/QRCodeDisplay';
import DeliveryStatusBadge from '../components/common/DeliveryStatusBadge';

const TrackOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Find order from my-orders list. (In a real app, you'd have a GET /orders/:id route)
        const data = await api.get('/orders/my-orders');
        const found = data.find(o => o.id === id);
        if (!found) {
          toast.error('Order not found');
          navigate('/orders');
          return;
        }
        setOrder(found);
      } catch (err) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!order) return null;

  const isCompleted = order.status === 'Delivered' || order.status === 'Picked Up';
  const showQR = !isCompleted && order.status !== 'Cancelled';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', paddingBottom: '5rem', color: 'var(--clr-text)' }}>
      <div style={{ 
        background: 'var(--clr-surface)', 
        borderBottom: '1px solid var(--clr-border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        padding: '0.75rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Track Order</h1>
        </div>
        <DeliveryStatusBadge status={order.status} />
      </div>

      <div style={{ width: '100%', maxWidth: '600px', margin: '2rem auto 0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Tracking Timeline */}
        <div style={{ 
          background: 'var(--clr-surface)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--clr-border)', 
          boxShadow: 'var(--shadow-sm)' 
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--clr-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📍</span> Order Status
          </h2>
          <TrackingTimeline currentStatus={order.status} deliveryMethod={order.delivery_method} />
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div style={{ 
            background: 'var(--clr-surface)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--clr-primary-border)', 
            boxShadow: 'var(--shadow-sm)',
            background: 'linear-gradient(135deg, var(--clr-surface) 0%, var(--clr-primary-bg) 100%)'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--clr-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Verification QR Code
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
              {order.delivery_method === 'home_delivery' 
                ? "Show this QR code to the delivery agent to receive your order." 
                : "Show this QR code to the pharmacist at the store."}
            </p>
            <QRCodeDisplay 
              value={order.qr_code} 
              label={order.delivery_method === 'home_delivery' 
                ? "Show this QR code to the delivery agent to receive your order." 
                : "Show this QR code to the pharmacist at the store."} 
            />
          </div>
        )}

        {/* Delivery Agent Info (If Assigned) */}
        {order.agent && (
          <div style={{ 
            background: 'var(--clr-surface)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--clr-border)', 
            boxShadow: 'var(--shadow-sm)' 
          }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>
              Delivery Agent
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                background: 'var(--clr-surface-alt)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--clr-text-muted)' 
              }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{order.agent.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--clr-text-muted)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                  <Phone size={14} />
                  <span>{order.agent.phone}</span>
                </div>
              </div>
              <a 
                href={`tel:${order.agent.phone}`} 
                style={{ 
                  padding: '0.75rem', 
                  background: 'var(--clr-success-bg)', 
                  color: 'var(--clr-success)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                  textDecoration: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                onMouseOut={e => e.currentTarget.style.opacity = 1}
              >
                <Phone size={20} />
              </a>
            </div>
            {order.estimated_delivery_time && !isNaN(new Date(order.estimated_delivery_time).getTime()) && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--clr-border)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', margin: 0 }}>
                  <span style={{ fontWeight: '500', color: 'var(--clr-text)' }}>Estimated Delivery: </span> 
                  <span style={{ color: 'var(--clr-primary)', fontWeight: 'bold' }}>
                    {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Summary */}
        <div style={{ 
          background: 'var(--clr-surface)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--clr-border)', 
          boxShadow: 'var(--shadow-sm)' 
        }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>
            Order Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--clr-text-muted)' }}>Pharmacy</span>
              <span style={{ fontWeight: '500', textAlign: 'right' }}>{order.pharmacy_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--clr-text-muted)' }}>Delivery Method</span>
              <span style={{ fontWeight: '500', textAlign: 'right' }}>
                {order.delivery_method === 'home_delivery' ? '🚗 Home Delivery' : '🏪 Store Pickup'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--clr-text-muted)' }}>Payment</span>
              <span style={{ fontWeight: '500', textAlign: 'right' }}>
                {order.payment_method === 'pay_on_delivery' ? '💵 Pay on Delivery' : '💳 Pay at Shop'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '1rem', 
              paddingTop: '0.75rem', 
              borderTop: '1px dashed var(--clr-border)',
              marginTop: '0.25rem'
            }}>
              <span style={{ color: 'var(--clr-text-muted)' }}>Amount</span>
              <span style={{ fontWeight: 'bold', color: 'var(--clr-primary)' }}>₹{Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrderPage;
