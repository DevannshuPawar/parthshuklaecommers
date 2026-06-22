import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.order;

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been placed and is being processed. You will receive a confirmation soon.</p>

        {orderData && (
          <div className="order-details-box">
            <div className="order-detail-row">
              <span className="label">Order ID</span>
              <span className="value blue">#{orderData.orderNumber}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Total Amount</span>
              <span className="value">{orderData.total_amount ? `₹${parseFloat(orderData.total_amount).toLocaleString()}` : '-'}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Payment Status</span>
              <span className="value" style={{ color: orderData.payment_status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {orderData.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending (COD)'}
              </span>
            </div>
            <div className="order-detail-row">
              <span className="label">Order Status</span>
              <span className="value" style={{ color: '#4f46e5', fontWeight: 600 }}>
                {orderData.status === 'confirmed' ? '🔵 Confirmed' : '🔵 Placed'}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="success-btn">📦 View My Orders</Link>
          <Link to="/" className="success-btn success-btn-outline">🛍️ Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
