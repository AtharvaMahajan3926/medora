import React from 'react';
import { Package, MapPin, Phone, Truck, Clock, AlertTriangle } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';

const OrderCard = ({ order, onClick, actionButton }) => {
  const isEmergency = order.is_emergency;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border p-5 transition-all hover:shadow-md ${isEmergency ? 'border-red-200 bg-red-50/10' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order ID</span>
            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">#{String(order.id).slice(-6)}</span>
            {isEmergency && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-red-200">
                <AlertTriangle size={12} /> Emergency
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{order.pharmacy_name || order.customer_name}</h3>
        </div>
        <DeliveryStatusBadge status={order.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Package size={16} className="mt-0.5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-800">{order.items?.length || 0} Items</p>
            <p className="text-xs">{order.items?.map(i => i.medicine_name).join(', ')}</p>
          </div>
        </div>

        {order.delivery_method === 'home_delivery' && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin size={16} className="mt-0.5 text-gray-400" />
            <p className="text-xs">{order.address?.street}, {order.address?.city}</p>
          </div>
        )}

        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Truck size={16} className="mt-0.5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-800">
              {order.delivery_method === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
            </p>
            <p className="text-xs text-gray-500">
              {order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery' : 'Pay at Shop'}
            </p>
          </div>
        </div>

        {order.estimated_delivery_time && !isNaN(new Date(order.estimated_delivery_time).getTime()) && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Clock size={16} className="mt-0.5 text-gray-400" />
            <p className="font-medium text-blue-700">
              ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">${Number(order.total_amount || 0).toFixed(2)}</p>
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
    </div>
  );
};

export default OrderCard;
