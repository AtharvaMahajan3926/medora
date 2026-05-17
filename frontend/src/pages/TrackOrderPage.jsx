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
        const { data } = await api.get('/orders/my-orders');
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Track Order</h1>
        </div>
        <DeliveryStatusBadge status={order.status} />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Tracking Timeline */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Order Status</h2>
          <TrackingTimeline currentStatus={order.status} deliveryMethod={order.delivery_method} />
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="bg-white p-6 rounded-xl border shadow-sm border-blue-100 bg-blue-50/30">
            <h2 className="font-bold text-gray-800 mb-4 text-center">Verification QR Code</h2>
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
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider text-gray-500">Delivery Agent</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{order.agent.name}</p>
                <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm">
                  <Phone size={14} />
                  <span>{order.agent.phone}</span>
                </div>
              </div>
              <a href={`tel:${order.agent.phone}`} className="p-3 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                <Phone size={20} />
              </a>
            </div>
            {order.estimated_delivery_time && !isNaN(new Date(order.estimated_delivery_time).getTime()) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Estimated Delivery: </span> 
                  <span className="text-blue-700 font-bold">
                    {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Summary */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider text-gray-500">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pharmacy</span>
              <span className="font-medium text-right">{order.pharmacy_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Method</span>
              <span className="font-medium text-right">
                {order.delivery_method === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment</span>
              <span className="font-medium text-right">
                {order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery' : 'Pay at Shop'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-right">${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrderPage;
