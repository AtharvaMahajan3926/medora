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
    <div style={{ padding: 'var(--sp-md) 0', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background line */}
        <div style={{ position: 'absolute', left: 0, top: '16px', width: '100%', height: '4px', background: 'var(--clr-border)', zIndex: 0, borderRadius: '2px' }}></div>
        
        {/* Active line progress */}
        {currentIndex >= 0 && (
          <div 
            style={{ position: 'absolute', left: 0, top: '16px', height: '4px', background: 'var(--clr-success)', zIndex: 0, borderRadius: '2px', transition: 'width 0.5s ease', width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        )}

        {steps.map((step, idx) => {
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;
          
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'all 0.3s ease',
                background: isCompleted ? 'var(--clr-success)' : 'var(--clr-surface)',
                color: isCompleted ? 'var(--clr-surface)' : 'var(--clr-text-muted)',
                border: `2px solid ${isCompleted ? 'var(--clr-success)' : 'var(--clr-border)'}`,
                boxShadow: isCurrent ? '0 0 0 4px var(--clr-success-bg)' : 'none'
              }}>
                {isCompleted ? <CheckCircle2 size={18} strokeWidth={3} /> : <Circle size={14} />}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                marginTop: '0.5rem', 
                fontWeight: isCurrent ? 'bold' : '500', 
                maxWidth: '60px', 
                textAlign: 'center', 
                lineHeight: 1.2,
                color: isCurrent ? 'var(--clr-success)' : isCompleted ? 'var(--clr-text)' : 'var(--clr-text-muted)' 
              }}>
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
