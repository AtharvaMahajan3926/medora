import React from 'react';

const DeliveryStatusBadge = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'pending': return { bg: 'var(--clr-warning-bg)', color: 'var(--clr-warning)', border: 'var(--clr-warning)' };
      case 'accepted': return { bg: 'var(--clr-info-bg)', color: 'var(--clr-info)', border: 'var(--clr-info)' };
      case 'rejected': return { bg: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', border: 'var(--clr-danger)' };
      case 'packed': return { bg: 'var(--clr-primary-bg)', color: 'var(--clr-primary)', border: 'var(--clr-primary)' };
      case 'ready for pickup': return { bg: 'var(--clr-success-bg)', color: 'var(--clr-success)', border: 'var(--clr-success)' };
      case 'assigned to delivery agent': return { bg: 'var(--clr-warning-bg)', color: 'var(--clr-warning)', border: 'var(--clr-warning)' };
      case 'out for delivery': return { bg: 'var(--clr-primary-bg)', color: 'var(--clr-primary)', border: 'var(--clr-primary)' };
      case 'delivered': return { bg: 'var(--clr-success-bg)', color: 'var(--clr-success)', border: 'var(--clr-success)' };
      case 'picked up': return { bg: 'var(--clr-success-bg)', color: 'var(--clr-success)', border: 'var(--clr-success)' };
      case 'completed': return { bg: 'var(--clr-success-bg)', color: 'var(--clr-success)', border: 'var(--clr-success)' };
      case 'cancelled': return { bg: 'var(--clr-surface-alt)', color: 'var(--clr-text-muted)', border: 'var(--clr-border)' };
      default: return { bg: 'var(--clr-surface-alt)', color: 'var(--clr-text-muted)', border: 'var(--clr-border)' };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <span style={{ 
      padding: '4px 12px', 
      borderRadius: '9999px', 
      fontSize: '0.75rem', 
      fontWeight: 'bold', 
      background: styles.bg, 
      color: styles.color,
      border: `1px solid ${styles.border}`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {status || 'Unknown'}
    </span>
  );
};

export default DeliveryStatusBadge;
