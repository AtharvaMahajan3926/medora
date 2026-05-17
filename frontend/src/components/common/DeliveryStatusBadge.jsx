import React from 'react';

const DeliveryStatusBadge = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'packed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ready for pickup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'assigned to delivery agent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out for delivery': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'picked up': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default DeliveryStatusBadge;
