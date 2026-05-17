import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OrderCard from '../components/common/OrderCard';
import { PackageSearch } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get('/orders/my-orders');
        setOrders(data);
      } catch (err) {
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      minHeight: '85vh',
      color: 'var(--clr-text)'
    }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1.5rem', width: '100%' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: '800',
          margin: 0,
          background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          display: 'inline-block'
        }}>
          📦 My Orders
        </h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
          Track your real-time medicine bookings, home deliveries, and pickup QR codes.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <span className="spin" style={{ fontSize: '2rem', display: 'inline-block' }}>⏳</span>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--clr-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--clr-border)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px',
          margin: '2rem auto'
        }}>
          <PackageSearch size={48} style={{ color: 'var(--clr-text-muted)', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--clr-text)', marginBottom: '0.5rem' }}>No Orders Yet</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Looks like you haven't placed any medicine orders yet.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem' }}
          >
            Find Medicines
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              onClick={() => navigate(`/track/${order.id}`)}
              actionButton={
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/track/${order.id}`); }}
                  className="btn btn-primary btn-sm"
                  style={{
                    boxShadow: 'var(--button-glow)'
                  }}
                >
                  Track / View QR
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
