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
      const { data } = await api.get('/addresses/');
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
      
      const { data } = await api.post('/orders/', orderData);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        {/* Medicine Details */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Order Items</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{medicine.name}</p>
              <p className="text-gray-500 text-sm">{medicine.category} • ${price.toFixed(2)}</p>
            </div>
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={medicine.stock || 10} />
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Delivery Method</h2>
          <DeliveryMethodSelector selected={deliveryMethod} onChange={(method) => {
            setDeliveryMethod(method);
            if (method === 'store_pickup') setPaymentMethod('pay_at_shop');
            else setPaymentMethod('pay_on_delivery');
          }} />

          {deliveryMethod === 'home_delivery' && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Delivery Address</h3>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-blue-600 text-sm font-medium hover:underline">
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {showAddressForm ? (
                <AddressForm onSubmit={handleAddressSubmit} onCancel={() => setShowAddressForm(false)} />
              ) : (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No addresses saved. Please add an address.</p>
                  ) : (
                    addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                        <input 
                          type="radio" 
                          name="address" 
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-semibold">{addr.full_name} <span className="text-gray-500 font-normal ml-2">{addr.phone_number}</span></p>
                          <p className="text-sm text-gray-600 mt-1">{addr.house_number}, {addr.street}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}

              {/* Emergency Delivery Option */}
              <label className={`mt-6 flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${isEmergency ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                <input 
                  type="checkbox" 
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="mt-1 text-red-600 rounded focus:ring-red-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={isEmergency ? 'text-red-600' : 'text-gray-400'} />
                    <p className={`font-semibold ${isEmergency ? 'text-red-700' : 'text-gray-700'}`}>Emergency Delivery</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Priority dispatch. Additional charges apply.</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Payment Method</h2>
          <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery (Cash/UPI)' : 'Pay at Shop'}
            </span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold">OFFLINE ONLY</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">To ensure reliability, all payments are handled physically during delivery or pickup.</p>
        </div>

        {/* Bill Summary */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Bill Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Item Total ({quantity} x ${price.toFixed(2)})</span>
              <span>${itemTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
              <span>Total Payable</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleCheckout}
          disabled={loading || (deliveryMethod === 'home_delivery' && !selectedAddressId)}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? 'Processing...' : `Confirm Order • $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
