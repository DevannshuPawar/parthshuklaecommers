import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page-title">Your Cart</h1>
        <div className="empty-cart">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <p>Your cart is empty!</p>
          <span>Add some products to get started</span>
          <br />
          <Link to="/" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Your Cart ({cartItems.length} items)</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map(item => {
            const imgSrc = item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`;
            return (
              <div key={item.id} className="cart-item-card">
                <img
                  src={imgSrc}
                  alt={item.name}
                  className="cart-item-img"
                  onError={e => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{parseFloat(item.price).toLocaleString()}</div>
                </div>
                <div className="cart-item-qty">
                  <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span className="cart-qty-num">{item.quantity}</span>
                  <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, minWidth: 80, textAlign: 'right', color: 'var(--primary)' }}>
                  ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </div>
                <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary ({cartItems.length} items)</h3>
          {cartItems.map(item => (
            <div key={item.id} className="checkout-summary-item">
              <span className="item-name">{item.name}</span>
              <span className="item-price">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-row" style={{ marginTop: 8 }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? '🎉 FREE' : `₹${shipping}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
