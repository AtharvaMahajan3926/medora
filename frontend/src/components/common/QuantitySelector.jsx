import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantitySelector = ({ quantity, onChange, max = 10, min = 1 }) => {
  const handleDecrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-min">
      <button 
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-600"
      >
        <Minus size={16} />
      </button>
      <div className="w-10 text-center font-medium text-gray-800 text-sm">
        {quantity}
      </div>
      <button 
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-600"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
