import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const TrackingTimeline = ({ currentStatus, deliveryMethod }) => {
  const isHomeDelivery = deliveryMethod === 'home_delivery';
  
  const homeDeliverySteps = [
    { label: 'Pending', active: true },
    { label: 'Accepted', active: true },
    { label: 'Packed', active: true },
    { label: 'Out for Delivery', active: true },
    { label: 'Delivered', active: true }
  ];

  const storePickupSteps = [
    { label: 'Pending', active: true },
    { label: 'Accepted', active: true },
    { label: 'Ready for Pickup', active: true },
    { label: 'Picked Up', active: true }
  ];

  const steps = isHomeDelivery ? homeDeliverySteps : storePickupSteps;
  
  // Find current step index
  let currentIndex = steps.findIndex(s => s.label.toLowerCase() === currentStatus?.toLowerCase());
  
  // Handle some intermediate statuses
  if (currentIndex === -1 && currentStatus === 'Assigned to Delivery Agent') {
    currentIndex = steps.findIndex(s => s.label === 'Packed'); // Visually between packed and out for delivery
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
        
        {/* Active line progress */}
        {currentIndex >= 0 && (
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        )}

        {steps.map((step, idx) => {
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;
          
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={16} />}
              </div>
              <span className={`text-xs mt-2 font-medium max-w-[60px] text-center ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
