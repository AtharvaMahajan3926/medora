import React, { useState } from 'react';
import { Package, MapPin, Phone, Truck, Clock, AlertTriangle } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';

const OrderCard = ({ order, onClick, actionButton }) => {
  const isEmergency = order.is_emergency;
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      style={{
        background: 'var(--clr-surface)',
        borderRadius: 'var(--radius-lg)',
        border: isEmergency ? '1.5px solid var(--clr-danger)' : '1px solid var(--clr-border)',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? 'var(--shadow-lg), var(--card-glow)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient glow edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: isEmergency ? 'var(--clr-danger)' : 'var(--clr-primary)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Order ID</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--clr-text)', background: 'var(--clr-surface-alt)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
              #{String(order.id).slice(-6)}
            </span>
            {isEmergency && (
              <span style={{ 
                fontSize: '0.7rem', 
                background: 'var(--clr-danger-bg)', 
                color: 'var(--clr-danger)', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontWeight: '600', 
                border: '1px solid var(--clr-danger)' 
              }}>
                <AlertTriangle size={10} /> Emergency
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--clr-text)', margin: 0 }}>
            {order.pharmacy_name || order.customer_name}
          </h3>
        </div>
        <DeliveryStatusBadge status={order.status} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
          <Package size={16} style={{ marginTop: '2px', color: 'var(--clr-primary)' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--clr-text)' }}>
              {order.items?.length || 0} Items
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
              {order.items?.map(i => i.medicine_name).join(', ')}
            </p>
          </div>
        </div>

        {order.delivery_method === 'home_delivery' && order.address && (
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <MapPin size={16} style={{ marginTop: '2px', color: 'var(--clr-text-muted)' }} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
              {[order.address.house_number, order.address.street, order.address.city].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
          <Truck size={16} style={{ marginTop: '2px', color: 'var(--clr-text-muted)' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', color: 'var(--clr-text)' }}>
              {order.delivery_method === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
              {order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery' : 'Pay at Shop'}
            </p>
          </div>
        </div>

        {order.estimated_delivery_time && !isNaN(new Date(order.estimated_delivery_time).getTime()) && (
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Clock size={16} style={{ marginTop: '2px', color: 'var(--clr-info)' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--clr-info)' }}>
              ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: '1rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--clr-border)',
        paddingLeft: '0.5rem'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Total Amount</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '1.2rem', fontWeight: '800', color: 'var(--clr-primary)' }}>
            ₹{Number(order.total_amount || 0).toFixed(2)}
          </p>
        </div>
        {actionButton && <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>}
      </div>
    </div>
  );
};

export default OrderCard;
