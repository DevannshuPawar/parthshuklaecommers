import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrder(prev => ({ ...prev, status }));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>⏳ Loading order details...</div>
    </div>
  );

  if (!order) return (
    <div className="page-content">
      <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>❌ Order not found</div>
    </div>
  );

  const address = order.delivery_address || order.address || {};

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Order #{order.id}</h1>
          <p>Order details and management</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
            ← Back to Orders
          </button>
        </div>
      </div>
      <div className="page-content">
        <div className="order-detail-grid">
          {/* Order Info */}
          <div className="detail-card">
            <h3>📋 Order Information</h3>
            <div className="detail-row">
              <span className="label">Order ID</span>
              <span className="value" style={{ color: '#4f46e5', fontWeight: 700 }}>#{order.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Date</span>
              <span className="value">{new Date(order.created_at).toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount</span>
              <span className="value" style={{ fontWeight: 700, fontSize: 16 }}>₹{parseFloat(order.total_amount || 0).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Method</span>
              <span className="value">{order.payment_method || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Status</span>
              <span className="value">
                <span className={`badge badge-${order.payment_status}`}>{order.payment_status}</span>
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Order Status</span>
              <span className="value">
                <select
                  className="status-select"
                  value={order.status}
                  onChange={e => updateStatus(e.target.value)}
                  disabled={updating}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="detail-card">
            <h3>👤 Customer Information</h3>
            <div className="detail-row">
              <span className="label">Name</span>
              <span className="value">{order.user_name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value">{order.user_email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Phone</span>
              <span className="value">{order.user_phone || address.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="detail-card">
            <h3>📍 Delivery Address</h3>
            {typeof address === 'string' ? (
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{address}</p>
            ) : (
              <>
                {address.name && (
                  <div className="detail-row">
                    <span className="label">Name</span>
                    <span className="value">{address.name}</span>
                  </div>
                )}
                {address.phone && (
                  <div className="detail-row">
                    <span className="label">Phone</span>
                    <span className="value">{address.phone}</span>
                  </div>
                )}
                {address.street && (
                  <div className="detail-row">
                    <span className="label">Street</span>
                    <span className="value">{address.street}</span>
                  </div>
                )}
                {address.city && (
                  <div className="detail-row">
                    <span className="label">City</span>
                    <span className="value">{address.city}</span>
                  </div>
                )}
                {address.state && (
                  <div className="detail-row">
                    <span className="label">State</span>
                    <span className="value">{address.state}</span>
                  </div>
                )}
                {address.pincode && (
                  <div className="detail-row">
                    <span className="label">Pincode</span>
                    <span className="value">{address.pincode}</span>
                  </div>
                )}
                {address.lat && address.lng && (
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={`https://www.google.com/maps?q=${address.lat},${address.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      🗺️ View on Google Maps
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Items */}
          <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h3>📦 Order Items</h3>
            <table className="data-table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <img
                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.product_name}
                        className="product-img"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/44x44?text=N/A'; }}
                      />
                    </td>
                    <td><strong>{item.product_name}</strong></td>
                    <td>₹{parseFloat(item.price || 0).toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td><strong>₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toLocaleString()}</strong></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700, paddingTop: 16 }}>Total:</td>
                  <td style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b' }}>₹{parseFloat(order.total_amount || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
