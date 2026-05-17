import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Truck, Store, AlertTriangle } from 'lucide-react';
import DeliveryMethodSelector from '../components/common/DeliveryMethodSelector';
import AddressForm from '../components/common/AddressForm';
import QuantitySelector from '../components/common/QuantitySelector';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { medicine, pharmacyId } = location.state || {};

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('home_delivery');
  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!medicine || !pharmacyId) {
      toast.error('Invalid checkout request');
      navigate('/dashboard');
      return;
    }
    fetchAddresses();
  }, [medicine, pharmacyId, navigate]);

  const fetchAddresses = async () => {
    try {
      const data = await api.get('/addresses/');
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddressSubmit = async (formData) => {
    try {
      await api.post('/addresses/', formData);
      toast.success('Address added');
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handleCheckout = async () => {
    if (deliveryMethod === 'home_delivery' && !selectedAddressId) {
      return toast.error('Please select a delivery address');
    }

    try {
      setLoading(true);
      const orderData = {
        pharmacy_id: pharmacyId,
        items: [{ medicine_id: medicine.id || medicine._id || medicine.medicine_id, quantity }],
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        address_id: deliveryMethod === 'home_delivery' ? selectedAddressId : null,
        is_emergency: isEmergency
      };
      
      const data = await api.post('/orders/', orderData);
      toast.success('Order placed successfully!');
      navigate(`/track/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!medicine) return null;

  const price = Number(medicine.price) || 0;
  const itemTotal = price * quantity;
  const deliveryFee = deliveryMethod === 'home_delivery' ? (isEmergency ? 10 : 5) : 0;
  const total = itemTotal + deliveryFee;

  return (
    <div style={{ padding: 'var(--sp-xl)', width: '100%', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)', marginBottom: 'var(--sp-md)' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Checkout</h1>
      </div>

      {/* Order Items */}
      <div className="card" style={{ padding: 'var(--sp-xl)', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--sp-md)', marginTop: 0 }}>Order Items</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{medicine.name}</p>
            <p style={{ margin: 0, color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{medicine.category} • ₹{price.toFixed(2)} / unit</p>
          </div>
          <QuantitySelector quantity={quantity} onChange={setQuantity} max={medicine.stock || 10} />
        </div>
      </div>

      {/* Delivery Method */}
      <div className="card" style={{ padding: 'var(--sp-xl)', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--sp-md)', marginTop: 0 }}>Delivery Method</h2>
        <DeliveryMethodSelector selected={deliveryMethod} onChange={(method) => {
          setDeliveryMethod(method);
          if (method === 'store_pickup') setPaymentMethod('pay_at_shop');
          else setPaymentMethod('pay_on_delivery');
        }} />

        {deliveryMethod === 'home_delivery' && (
          <div style={{ marginTop: 'var(--sp-lg)', paddingTop: 'var(--sp-lg)', borderTop: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-md)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Delivery Address</h3>
              <button onClick={() => setShowAddressForm(!showAddressForm)} style={{ color: 'var(--clr-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                {showAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showAddressForm ? (
              <AddressForm onSubmit={handleAddressSubmit} onCancel={() => setShowAddressForm(false)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                {addresses.length === 0 ? (
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No addresses saved. Please add an address.</p>
                ) : (
                  addresses.map(addr => (
                    <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-md)', padding: 'var(--sp-md)', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedAddressId === addr.id ? 'var(--clr-primary)' : 'var(--clr-border)'}`, cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--clr-primary-bg)' : 'transparent', transition: 'all 0.2s ease' }}>
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: '4px', accentColor: 'var(--clr-primary)' }}
                      />
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{addr.full_name} <span style={{ color: 'var(--clr-text-muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>{addr.phone_number}</span></p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-light)' }}>{addr.house_number}, {addr.street}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-light)' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}

            {/* Emergency Delivery Option */}
            <label style={{ marginTop: 'var(--sp-lg)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-md)', padding: 'var(--sp-md)', borderRadius: 'var(--radius-md)', border: `2px solid ${isEmergency ? 'var(--clr-danger)' : 'var(--clr-border)'}`, cursor: 'pointer', background: isEmergency ? 'var(--clr-danger-bg)' : 'transparent', transition: 'all 0.2s ease' }}>
              <input 
                type="checkbox" 
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                style={{ marginTop: '4px', accentColor: 'var(--clr-danger)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem 0' }}>
                  <AlertTriangle size={18} color={isEmergency ? 'var(--clr-danger)' : 'var(--clr-text-muted)'} />
                  <p style={{ margin: 0, fontWeight: 'bold', color: isEmergency ? 'var(--clr-danger)' : 'var(--clr-text)' }}>Emergency Delivery</p>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>Priority dispatch. Additional charges apply.</p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="card" style={{ padding: 'var(--sp-xl)', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--sp-md)', marginTop: 0 }}>Payment Method</h2>
        <div style={{ padding: 'var(--sp-md)', background: 'var(--clr-surface-alt)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '500', color: 'var(--clr-text)' }}>
            {paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery (Cash/UPI)' : 'Pay at Shop'}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>OFFLINE ONLY</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>To ensure reliability, all payments are handled physically during delivery or pickup.</p>
      </div>

      {/* Bill Summary */}
      <div className="card" style={{ padding: 'var(--sp-xl)', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--sp-md)', marginTop: 0 }}>Bill Summary</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--clr-text)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Item Total ({quantity} x ₹{price.toFixed(2)})</span>
            <span>₹{itemTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--clr-text)' }}>
            <span>Total Payable</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={handleCheckout}
        disabled={loading || (deliveryMethod === 'home_delivery' && !selectedAddressId)}
        className="btn btn-primary"
        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: 'var(--sp-sm)', opacity: loading || (deliveryMethod === 'home_delivery' && !selectedAddressId) ? 0.5 : 1 }}
      >
        {loading ? 'Processing...' : `Confirm Order • ₹${total.toFixed(2)}`}
      </button>
    </div>
  );
};

export default CheckoutPage;
