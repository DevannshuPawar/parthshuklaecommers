import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [form, setForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    pincode: '',
    lat: null,
    lng: null
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems]);

  const getLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        toast.success('📍 Location captured successfully!');
        setLocationLoading(false);
      },
      (err) => {
        toast.error('Could not get location. Please allow location access.');
        setLocationLoading(false);
      }
    );
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }

    setLoading(true);
    if (paymentMethod === 'cod') {
      try {
        const verifyRes = await api.post('/orders/cod', {
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: total,
          shipping_charge: shipping,
          ...form
        });
        clearCart();
        navigate('/order-success', { state: { order: verifyRes.data } });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to place COD order');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderRes = await api.post('/orders/razorpay', { amount: total });
      const razorpayOrder = orderRes.data.order;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_live_Sg3wcq1sjSWIgl',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'ShopKart',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cart_items: cartItems.map(item => ({
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),
              total_amount: total,
              shipping_charge: shipping,
              ...form
            });
            clearCart();
            navigate('/order-success', { state: { order: verifyRes.data } });
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: form.full_name,
          email: user?.email || '',
          contact: form.phone
        },
        theme: { color: '#4F46E5' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error('Payment failed: ' + resp.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1 className="checkout-page-title">Checkout</h1>

      <div className="checkout-layout">
        <div>
          <div className="checkout-card">
            <h3>📍 Delivery Address</h3>
            <form onSubmit={handlePay}>
              <div className="form-grid-2" style={{ marginBottom: 14 }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input className="checkout-form-input" placeholder="Full name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Phone *</label>
                  <input className="checkout-form-input" placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Address Line 1 *</label>
                <input className="checkout-form-input" placeholder="House no., Street" value={form.address_line1} onChange={e => setForm({...form, address_line1: e.target.value})} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Address Line 2 (Optional)</label>
                <input className="checkout-form-input" placeholder="Landmark, Area" value={form.address_line2} onChange={e => setForm({...form, address_line2: e.target.value})} />
              </div>
              <div className="form-grid-2" style={{ marginBottom: 14 }}>
                <div>
                  <label className="form-label">City *</label>
                  <input className="checkout-form-input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <input className="checkout-form-input" placeholder="Pincode" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required />
                </div>
              </div>
            </form>
          </div>

          <div className="checkout-card">
            <h3>📡 Location (for Delivery)</h3>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 12 }}>
              Share your current location for accurate delivery tracking.
            </p>
            <button className="location-btn" onClick={getLocation} disabled={locationLoading}>
              {locationLoading ? '⏳ Getting location...' : '📍 Use Current Location'}
            </button>
            {form.lat && form.lng && (
              <div className="location-coords">
                📍 Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)} ✅
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="checkout-card">
            <h3>💳 Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 12, border: paymentMethod === 'online' ? '1px solid #4F46E5' : '1px solid #e5e7eb', borderRadius: 8 }}>
                <input type="radio" name="payment_method" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e1b4b' }}>Pay Online</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Secure online payment via Razorpay</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 12, border: paymentMethod === 'cod' ? '1px solid #4F46E5' : '1px solid #e5e7eb', borderRadius: 8 }}>
                <input type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e1b4b' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Pay in cash upon delivery</div>
                </div>
              </label>
            </div>
          </div>

          <div className="checkout-card">
            <h3>🧾 Order Summary</h3>
            {cartItems.map(item => (
              <div key={item.id} className="checkout-summary-item">
                <span className="item-name">{item.name} ×{item.quantity}</span>
                <span className="item-price">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="summary-row" style={{ marginTop: 12 }}>
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="checkout-total-row">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>

            <button className="razorpay-btn" onClick={handlePay} disabled={loading}>
              {loading ? '⏳ Processing...' : paymentMethod === 'cod' ? `📦 Place COD Order - ₹${total.toLocaleString()}` : `💳 Pay with Razorpay - ₹${total.toLocaleString()}`}
            </button>
            <div className="secure-badge">🔒 Secured by Razorpay</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
