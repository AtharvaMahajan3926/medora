import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, Phone, Package, Navigation, LogOut, CheckCircle2, Store } from 'lucide-react';

// Using standard un-authenticated Maps linking since we don't have a map library explicitly set up for routing yet
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
        const { data } = await api.get('/delivery/available-orders');
        setAvailableOrders(data);
      } else {
        const { data } = await api.get('/delivery/my-deliveries');
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
      toast.success('Order assigned to you!');
      setActiveTab('active');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign order');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/agent-login');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-blue-800 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <TruckIcon />
          <h1 className="font-bold text-xl">Agent Portal</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-blue-100 hover:text-white">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      <div className="flex border-b bg-white sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${activeTab === 'available' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Available Orders
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Deliveries
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : activeTab === 'available' ? (
          availableOrders.length === 0 ? (
            <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm border">No available orders right now.</div>
          ) : (
            availableOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-xl border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{String(order.id).slice(-6)}</span>
                  {order.is_emergency && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">EMERGENCY</span>}
                </div>
                <h3 className="font-bold text-lg">{order.pharmacy_name}</h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><MapPin size={14}/> {order.pharmacy_address}</p>
                <button 
                  onClick={() => handleAssign(order.id)}
                  className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Accept Delivery
                </button>
              </div>
            ))
          )
        ) : (
          myDeliveries.length === 0 ? (
            <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm border">You have no active deliveries.</div>
          ) : (
            myDeliveries.map(order => {
              const isDelivered = order.status === 'Delivered';
              return (
                <div key={order.id} className={`p-5 rounded-xl border shadow-sm ${isDelivered ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">#{String(order.id).slice(-6)}</span>
                      <h3 className="font-bold text-lg text-gray-800">{order.customer_name}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex gap-3 text-sm">
                      <Store className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-semibold text-gray-700">Pickup: {order.pharmacy_name}</p>
                        {order.pharmacy_lat && order.pharmacy_lng && !isDelivered && (
                          <a href={getMapsUrl(order.pharmacy_lat, order.pharmacy_lng)} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline mt-1 inline-flex items-center gap-1">
                            <Navigation size={12}/> Navigate to Pharmacy
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-semibold text-gray-700">Dropoff</p>
                        <p className="text-gray-600 text-xs mt-0.5">{order.address?.house_number}, {order.address?.street}, {order.address?.city}</p>
                        {order.address?.lat && order.address?.lng && !isDelivered && (
                          <a href={getMapsUrl(order.address.lat, order.address.lng)} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline mt-1 inline-flex items-center gap-1">
                            <Navigation size={12}/> Navigate to Customer
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Phone className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <a href={`tel:${order.customer_phone}`} className="text-gray-700 hover:text-blue-600 font-medium">{order.customer_phone}</a>
                    </div>
                  </div>

                  {!isDelivered && (
                    <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">To Collect</span>
                        <span className="font-bold text-lg">${Number(order.total_amount || 0).toFixed(2)}</span>
                      </div>
                      
                      {order.status !== 'Out for Delivery' ? (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Mark 'Out for Delivery'
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/qr-scan')}
                          className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                          <CheckCircle2 size={20} />
                          Scan QR & Complete Delivery
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>;

export default DeliveryDashboardPage;
