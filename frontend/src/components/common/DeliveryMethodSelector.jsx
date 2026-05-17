import React from 'react';
import { Truck, Store } from 'lucide-react';

const DeliveryMethodSelector = ({ selected, onChange }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
      <button
        type="button"
        onClick={() => onChange('home_delivery')}
        style={{
          padding: 'var(--sp-md)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${selected === 'home_delivery' ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
          background: selected === 'home_delivery' ? 'var(--clr-primary-bg)' : 'transparent',
          color: selected === 'home_delivery' ? 'var(--clr-primary)' : 'var(--clr-text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Truck size={32} color={selected === 'home_delivery' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Home Delivery</p>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Delivered to your address</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('store_pickup')}
        style={{
          padding: 'var(--sp-md)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${selected === 'store_pickup' ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
          background: selected === 'store_pickup' ? 'var(--clr-primary-bg)' : 'transparent',
          color: selected === 'store_pickup' ? 'var(--clr-primary)' : 'var(--clr-text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Store size={32} color={selected === 'store_pickup' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Store Pickup</p>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Pick up from pharmacy</p>
        </div>
      </button>
    </div>
  );
};

export default DeliveryMethodSelector;
