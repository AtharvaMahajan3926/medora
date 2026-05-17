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
        const { data } = await api.get('/orders/my-orders');
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border shadow-sm">
          <PackageSearch size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No Orders Yet</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Looks like you haven't placed any medicine orders yet.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Find Medicines
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              onClick={() => navigate(`/track/${order.id}`)}
              actionButton={
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/track/${order.id}`); }}
                  className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
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
