import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewOrderProduct, setReviewOrderProduct] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => setOrders(res.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileForm);
      updateUser(profileForm);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const getStatusClass = (status) => {
    const map = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      packed: 'status-packed',
      out_for_delivery: 'status-out_for_delivery',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return map[status] || 'status-pending';
  };

  const menuItems = [
    { key: 'orders', label: '📦 My Orders' },
    { key: 'profile', label: '👤 Profile' },
    { key: 'addresses', label: '📍 Addresses' },
    { key: 'logout', label: '🚪 Logout' }
  ];

  return (
    <div className="dashboard-page">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>My Account</h1>

      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-name">{user?.name}</div>
          <div className="user-email">{user?.email}</div>

          <div className="dashboard-menu">
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`dashboard-menu-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => {
                  if (item.key === 'logout') {
                    logout();
                    toast.success('Logged out successfully');
                    navigate('/');
                  } else {
                    setActiveTab(item.key);
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-main">
          {activeTab === 'orders' && (
            <>
              <div className="dashboard-section-title">My Orders</div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>Loading...</div>
              ) : orders.length === 0 ? (
                <div className="no-items">
                  <p>📭 No orders yet</p>
                  <span>Start shopping to see your orders here</span>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="order-history-card">
                    <div className="order-history-header">
                      <div>
                        <div className="order-number">#{order.order_number}</div>
                        <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div className="order-amount">₹{parseFloat(order.total_amount).toLocaleString()}</div>
                      <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="order-items-preview">
                      {order.items?.map(item => (
                        <span key={item.id}>• {item.product_name} ×{item.quantity}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                        {order.payment_status === 'paid' ? '✅ Payment Paid' : '⏳ Payment Pending'}
                      </span>
                      <button
                        style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <div className="dashboard-section-title">My Profile</div>
              <div className="profile-card">
                <form onSubmit={handleSaveProfile}>
                  <div className="profile-form-grid">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input
                        className="checkout-form-input"
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        className="checkout-form-input"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email (cannot change)</label>
                      <input className="checkout-form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div>
                      <label className="form-label">Account Type</label>
                      <input className="checkout-form-input" value={user?.role} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <button type="submit" className="save-profile-btn">💾 Save Changes</button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'addresses' && (
            <>
              <div className="dashboard-section-title">My Addresses</div>
              <div className="profile-card">
                <div className="no-items">
                  <p>📍 No saved addresses</p>
                  <span>Your delivery addresses from orders will appear here</span>
                </div>
                {orders.filter(o => o.address_line1).slice(0, 3).map(order => (
                  <div key={order.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{order.full_name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-light)' }}>
                      {order.address_line1}{order.address_line2 ? ', ' + order.address_line2 : ''}, {order.city} - {order.pincode}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onWriteReview={(productId, productName) => {
            setSelectedOrder(null);
            setReviewOrderProduct({ orderId: selectedOrder.id, productId, productName });
          }}
        />
      )}

      {reviewOrderProduct && (
        <WriteReviewModal 
          orderId={reviewOrderProduct.orderId}
          productId={reviewOrderProduct.productId}
          productName={reviewOrderProduct.productName}
          onClose={() => setReviewOrderProduct(null)}
          onSuccess={() => {
            setReviewOrderProduct(null);
            setLoading(true);
            api.get('/orders/my-orders')
              .then(res => setOrders(res.data.orders))
              .catch(() => toast.error('Failed to load orders'))
              .finally(() => setLoading(false));
          }}
        />
      )}
    </div>
  );
};

// Premium Order Details Modal with Tracking Timeline
const OrderDetailsModal = ({ order, onClose, onWriteReview }) => {
  const steps = [
    { label: 'Placed', status: 'pending' },
    { label: 'Confirmed', status: 'confirmed' },
    { label: 'Packed', status: 'packed' },
    { label: 'Out For Delivery', status: 'out_for_delivery' },
    { label: 'Delivered', status: 'delivered' }
  ];

  const statusMap = {
    'pending': 0,
    'confirmed': 1,
    'packed': 2,
    'out_for_delivery': 3,
    'delivered': 4
  };
  
  const currentIndex = statusMap[order.status] !== undefined ? statusMap[order.status] : 0;

  const expectedDate = new Date(order.created_at);
  expectedDate.setDate(expectedDate.getDate() + 3);
  const formattedExpected = expectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style dangerouslySetInnerHTML={{__html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .modal-container {
          background: white;
          width: 100%;
          max-width: 750px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #f3f4f6;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e1b4b;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #9ca3af;
          cursor: pointer;
          line-height: 1;
          padding: 4px;
        }
        .modal-close:hover {
          color: #1f2937;
        }
        .modal-body {
          padding: 24px;
          text-align: left;
        }
        
        /* Tracking Timeline */
        .tracking-timeline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0 30px 0;
          padding: 20px 0;
          position: relative;
        }
        .tracking-line {
          position: absolute;
          top: 50%;
          left: 40px;
          right: 40px;
          height: 4px;
          background: #e5e7eb;
          z-index: 1;
          transform: translateY(-50%);
        }
        .tracking-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #4f46e5;
          transition: width 0.4s ease;
        }
        .tracking-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          flex: 1;
        }
        .tracking-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: #9ca3af;
          border: 3px solid white;
          transition: all 0.3s ease;
        }
        .tracking-step.active .tracking-circle {
          background: #4f46e5;
          color: white;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        .tracking-step.completed .tracking-circle {
          background: #10b981;
          color: white;
        }
        .tracking-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
        }
        .tracking-step.active .tracking-label {
          color: #4f46e5;
        }
        .tracking-step.completed .tracking-label {
          color: #10b981;
        }
        
        /* Detail Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
        .info-card {
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 16px;
        }
        .info-card h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 700;
          color: #1e1b4b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .info-row:last-child {
          margin-bottom: 0;
        }
        .info-row span.lbl {
          color: #6b7280;
        }
        .info-row span.val {
          font-weight: 600;
          color: #374151;
        }
        
        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table th {
          text-align: left;
          padding: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #f3f4f6;
        }
        .items-table td {
          padding: 10px;
          font-size: 13px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
          text-align: left;
        }
        .item-img {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          object-fit: cover;
          background: #f3f4f6;
        }
      `}} />
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Order Details - #{order.order_number}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {order.status === 'cancelled' ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12, padding: 16, color: '#991b1b', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong>This order has been cancelled.</strong>
                <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>Contact customer support if you have any questions.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Timeline */}
              <div className="tracking-timeline">
                <div className="tracking-line">
                  <div className="tracking-line-fill" style={{ width: `${(currentIndex / 4) * 100}%` }}></div>
                </div>
                {steps.map((step, index) => {
                  let stepClass = '';
                  if (index < currentIndex) stepClass = 'completed';
                  else if (index === currentIndex) stepClass = 'active';

                  return (
                    <div key={step.status} className={`tracking-step ${stepClass}`}>
                      <div className="tracking-circle">
                        {index < currentIndex ? '✓' : index + 1}
                      </div>
                      <div className="tracking-label">{step.label}</div>
                    </div>
                  );
                })}
              </div>

              {order.status !== 'delivered' && (
                <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: 12, color: '#3730a3', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 20 }}>
                  📅 Expected Delivery: {formattedExpected}
                </div>
              )}
            </>
          )}

          {/* Grid */}
          <div className="info-grid">
            {/* Order Info */}
            <div className="info-card">
              <h4>📋 Order Information</h4>
              <div className="info-row">
                <span className="lbl">Order ID</span>
                <span className="val">#{order.order_number}</span>
              </div>
              <div className="info-row">
                <span className="lbl">Date</span>
                <span className="val">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="info-row">
                <span className="lbl">Payment Method</span>
                <span className="val">{order.payment_method || 'Online'}</span>
              </div>
              <div className="info-row">
                <span className="lbl">Payment Status</span>
                <span className="val" style={{ color: order.payment_status === 'paid' ? '#10b981' : '#f59e0b' }}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="info-row">
                <span className="lbl">Shipping Charge</span>
                <span className="val">₹{parseFloat(order.shipping_charge || 49).toLocaleString()}</span>
              </div>
              <div className="info-row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                <span className="lbl" style={{ fontWeight: 700, color: '#1e1b4b' }}>Total Amount</span>
                <span className="val" style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 15 }}>₹{parseFloat(order.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Address */}
            <div className="info-card">
              <h4>📍 Delivery Address</h4>
              {order.address_line1 ? (
                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>{order.full_name}</div>
                  <div>📞 {order.phone}</div>
                  <div style={{ marginTop: 4 }}>{order.address_line1}</div>
                  {order.address_line2 && <div>{order.address_line2}</div>}
                  <div>{order.city} - {order.pincode}</div>
                  {order.lat && order.lng && (
                    <div style={{ marginTop: 10 }}>
                      <a
                        href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
                      >
                        🗺️ View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No address information available</div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="info-card" style={{ padding: 16 }}>
            <h4 style={{ marginBottom: 12 }}>📦 Order Items</h4>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  {order.status === 'delivered' && <th style={{ textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map(item => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.product_name}
                        className="item-img"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x40?text=Product'; }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: '#374151' }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center' }}>₹{parseFloat(item.price).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e1b4b' }}>
                      ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                    </td>
                    {order.status === 'delivered' && (
                      <td style={{ textAlign: 'center' }}>
                        {item.is_reviewed > 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✅ Reviewed</span>
                        ) : (
                          <button
                            onClick={() => onWriteReview(item.product_id, item.product_name)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            ⭐ Review
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

// Write Review Modal Component
const WriteReviewModal = ({ orderId, productId, productName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('You can upload up to 5 images only');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    formData.append('order_id', orderId);
    images.forEach(img => {
      formData.append('images', img);
    });

    try {
      await api.post(`/products/${productId}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Write a Product Review</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>
            Product: <span style={{ color: '#4f46e5' }}>{productName}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>Rating</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    padding: 0,
                    color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
                    transition: 'color 0.1s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you think of the product? Share your experience..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>Add Images (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={images.length >= 5}
              style={{ fontSize: 13 }}
            />
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', width: 60, height: 60 }}>
                    <img
                      src={preview}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        fontSize: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
