import React from 'react';
import { Truck, Store } from 'lucide-react';

const DeliveryMethodSelector = ({ selected, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange('home_delivery')}
        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
          selected === 'home_delivery' 
            ? 'border-blue-600 bg-blue-50 text-blue-700' 
            : 'border-gray-200 hover:border-blue-300 text-gray-600'
        }`}
      >
        <Truck size={32} className={selected === 'home_delivery' ? 'text-blue-600' : 'text-gray-400'} />
        <div className="text-center">
          <p className="font-bold">Home Delivery</p>
          <p className="text-xs mt-1 opacity-80">Delivered to your address</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('store_pickup')}
        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
          selected === 'store_pickup' 
            ? 'border-blue-600 bg-blue-50 text-blue-700' 
            : 'border-gray-200 hover:border-blue-300 text-gray-600'
        }`}
      >
        <Store size={32} className={selected === 'store_pickup' ? 'text-blue-600' : 'text-gray-400'} />
        <div className="text-center">
          <p className="font-bold">Store Pickup</p>
          <p className="text-xs mt-1 opacity-80">Pick up from pharmacy</p>
        </div>
      </button>
    </div>
  );
};

export default DeliveryMethodSelector;
