import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, Phone, Navigation, CheckCircle2, Store, Clock } from 'lucide-react';

const getMapsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const DeliveryDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'available') {
        const data = await api.get('/delivery/available-orders');
        setAvailableOrders(data);
      } else {
        const data = await api.get('/delivery/my-deliveries');
        setMyDeliveries(data);
      }
    } catch (err) {
      toast.error('Failed to load data. Please ensure you are logged in as an agent.');
      if(err.response?.status === 401 || err.response?.status === 403) {
        navigate('/agent-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (orderId) => {
    try {
      await api.post(`/delivery/assign/${orderId}`);
      toast.success('Order accepted! It is now in your active list below.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.post(`/delivery/update-status/${orderId}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '90vh', background: 'var(--clr-bg)' }}>
      {/* Sidebar for Navigation */}
      <aside className="dashboard-sidebar" style={{
        width: '260px',
        background: 'var(--clr-surface)',
        borderRight: '1px solid var(--clr-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid var(--clr-border)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '0.05em', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>
            Agent Panel
          </h2>
        </div>
        <ul className="sidebar-nav" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li 
            className={activeTab === 'available' ? 'active' : ''} 
            onClick={() => setActiveTab('available')}
            style={{ 
              cursor: 'pointer',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              background: activeTab === 'available' ? 'var(--clr-primary-bg)' : 'transparent',
              color: activeTab === 'available' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'
            }}
            onMouseOver={e => { if(activeTab !== 'available') e.currentTarget.style.background = 'var(--clr-surface-alt)' }}
            onMouseOut={e => { if(activeTab !== 'available') e.currentTarget.style.background = 'transparent' }}
          >
            <span>📦</span> Available & Active
          </li>
          <li 
            className={activeTab === 'active' ? 'active' : ''} 
            onClick={() => setActiveTab('active')}
            style={{ 
              cursor: 'pointer',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              background: activeTab === 'active' ? 'var(--clr-primary-bg)' : 'transparent',
              color: activeTab === 'active' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'
            }}
            onMouseOver={e => { if(activeTab !== 'active') e.currentTarget.style.background = 'var(--clr-surface-alt)' }}
            onMouseOut={e => { if(activeTab !== 'active') e.currentTarget.style.background = 'transparent' }}
          >
            <span>📜</span> Delivery History
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ flex: 1, padding: '3rem', minHeight: '90vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          {/* Clean stacked header with subtle border divider */}
          <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: 'var(--clr-text)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeTab === 'available' ? '📦 Available & Active Orders' : '📜 Delivery History'}
            </h2>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
              {activeTab === 'available' 
                ? 'Manage your currently assigned deliveries and accept new orders in your region.'
                : 'Showcasing your completed deliveries.'
              }
            </p>
          </div>

          <div style={{ width: '100%' }}>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '5rem 2rem', 
                background: 'var(--clr-surface)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--clr-border)',
                boxShadow: 'var(--shadow-md)',
                maxWidth: '480px',
                margin: '3rem auto'
              }}>
                <span className="spin" style={{ display: 'inline-block', fontSize: '2.5rem' }}>⏳</span>
                <p style={{ marginTop: '1rem', color: 'var(--clr-text-muted)', fontWeight: '600', fontSize: '1rem' }}>Loading your orders...</p>
              </div>
            ) : activeTab === 'available' ? (
              availableOrders.length === 0 ? (
                /* Premium, Centered Empty State with soft gradient */
                <div style={{ 
                  padding: '4.5rem 2rem', 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, var(--clr-surface) 0%, var(--clr-background) 100%)', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--clr-border)', 
                  boxShadow: 'var(--shadow-lg)', 
                  maxWidth: '480px', 
                  margin: '4rem auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    marginBottom: '1.5rem', 
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
                    animation: 'pulse 2.5s infinite',
                    display: 'inline-block'
                  }}>
                    📦
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: '750', color: 'var(--clr-text)' }}>No Active Orders</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6', maxWidth: '320px' }}>
                    You are all caught up! When a pharmacist assigns an order to you, or new delivery requests appear, they will show up here.
                  </p>
                </div>
              ) : (
                /* Modern responsive multi-column grid layout */
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                  gap: '1.75rem', 
                  width: '100%',
                  alignItems: 'start'
                }}>
                  {availableOrders.map(order => {
                    const isAssigned = !!order.delivery_agent_id;
                    if (isAssigned) {
                      // Render rich active delivery details card
                      return (
                        <div key={order.id} className="interactive-card" style={{ 
                          background: 'var(--clr-surface)', 
                          padding: '2rem', 
                          borderRadius: 'var(--radius-xl)', 
                          border: '1px solid var(--clr-border)', 
                          boxShadow: 'var(--shadow-md)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--clr-primary), var(--clr-primary-light))' }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-alt)', padding: '0.25rem 0.6rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem', fontSize: '0.85rem', border: '1px solid var(--clr-border)', fontWeight: '600' }}>
                                #{String(order.id).slice(-6)}
                              </span>
                              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: 'var(--clr-text)' }}>{order.customer_name}</h3>
                            </div>
                            <span className="badge badge-warning" style={{ boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)' }}>
                              {order.status}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'var(--clr-background)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem' }}>
                              <Store size={18} style={{ color: 'var(--clr-primary)', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--clr-text)' }}>Pickup: {order.pharmacy_name}</strong>
                                <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', lineHeight: '1.4' }}>{order.pharmacy_address}</span>
                                {order.pharmacy_lat && order.pharmacy_lng && (
                                  <a href={getMapsUrl(order.pharmacy_lat, order.pharmacy_lng)} target="_blank" rel="noreferrer" style={{ color: 'var(--clr-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <Navigation size={13}/> Navigate to Pharmacy
                                  </a>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
                              <MapPin size={18} style={{ color: 'var(--clr-secondary)', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--clr-text)' }}>Dropoff Address</strong>
                                <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                  {[order.address?.house_number, order.address?.street, order.address?.city].filter(Boolean).join(', ')}
                                </span>
                                {order.address?.lat && order.address?.lng && (
                                  <a href={getMapsUrl(order.address.lat, order.address.lng)} target="_blank" rel="noreferrer" style={{ color: 'var(--clr-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <Navigation size={13}/> Navigate to Customer
                                  </a>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', alignItems: 'center', borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
                              <Phone size={18} style={{ color: 'var(--clr-text-muted)', flexShrink: 0 }} />
                              <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--clr-text)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                {order.customer_phone}
                              </a>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px dashed var(--clr-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>To Collect</span>
                              <strong style={{ fontSize: '1.45rem', color: 'var(--clr-primary)', fontWeight: '800' }}>₹{Number(order.total_amount || 0).toFixed(2)}</strong>
                            </div>
                            
                            {order.status !== 'Out for Delivery' ? (
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                                className="btn btn-secondary"
                                style={{ width: '100%', padding: '0.85rem', fontWeight: '600', borderRadius: 'var(--radius-lg)' }}
                              >
                                Mark 'Out for Delivery'
                              </button>
                            ) : (
                              <button 
                                onClick={() => navigate('/qr-scan')}
                                className="btn btn-success"
                                style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                              >
                                <CheckCircle2 size={18} />
                                Scan QR & Complete Delivery
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      // Render general unassigned available order card
                      return (
                        <div key={order.id} className="interactive-card" style={{ 
                          background: 'var(--clr-surface)', 
                          padding: '2rem', 
                          borderRadius: 'var(--radius-xl)', 
                          border: '1px solid var(--clr-border)', 
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-alt)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--clr-border)', fontWeight: '600' }}>
                              #{String(order.id).slice(-6)}
                            </span>
                            {order.is_emergency && <span className="badge badge-danger" style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' }}>EMERGENCY</span>}
                          </div>
                          <h3 style={{ margin: '0', fontSize: '1.35rem', fontWeight: '800', color: 'var(--clr-text)' }}>{order.pharmacy_name}</h3>
                          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                            <MapPin size={16} style={{ color: 'var(--clr-primary)', marginTop: '2px', flexShrink: 0 }}/> {order.pharmacy_address}
                          </p>
                          <button 
                            onClick={() => handleAssign(order.id)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.85rem', fontWeight: '600', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--button-glow)' }}
                          >
                            Accept Delivery
                          </button>
                        </div>
                      );
                    }
                  })}
                </div>
              )
            ) : (
              myDeliveries.length === 0 ? (
                /* History empty state with gradient */
                <div style={{ 
                  padding: '4.5rem 2rem', 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, var(--clr-surface) 0%, var(--clr-background) 100%)', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--clr-border)', 
                  boxShadow: 'var(--shadow-lg)', 
                  maxWidth: '480px', 
                  margin: '4rem auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    marginBottom: '1.5rem', 
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
                    animation: 'pulse 2.5s infinite',
                    display: 'inline-block'
                  }}>
                    📜
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: '750', color: 'var(--clr-text)' }}>No History Yet</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6', maxWidth: '320px' }}>
                    You have not completed any deliveries yet. Accepted orders will showcase here as a completed history log once they are successfully verified and delivered!
                  </p>
                </div>
              ) : (
                /* History grid */
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                  gap: '1.5rem', 
                  width: '100%',
                  alignItems: 'start'
                }}>
                  {myDeliveries.map(order => (
                    <div key={order.id} className="interactive-card" style={{ 
                      background: 'var(--clr-surface)', 
                      padding: '1.75rem', 
                      borderRadius: 'var(--radius-xl)', 
                      border: '1px solid var(--clr-border)',
                      opacity: 0.95,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-alt)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-block', marginBottom: '0.25rem', border: '1px solid var(--clr-border)', fontWeight: '600' }}>
                            #{String(order.id).slice(-6)}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--clr-text)' }}>{order.customer_name}</h3>
                        </div>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--clr-success-bg)', color: 'var(--clr-success)', border: '1px solid var(--clr-success-border)' }}>
                          ✓ Delivered
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--clr-text-muted)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'var(--clr-background)', 
                        padding: '0.85rem 1.25rem', 
                        borderRadius: 'var(--radius-lg)', 
                        border: '1px solid var(--clr-border)', 
                        marginTop: '0.25rem' 
                      }}>
                        <span>Collected from <strong>{order.pharmacy_name}</strong></span>
                        <strong style={{ color: 'var(--clr-success)', fontSize: '1.1rem', fontWeight: '800' }}>₹{Number(order.total_amount || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryDashboardPage;
