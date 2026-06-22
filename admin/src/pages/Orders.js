import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await api.get(`/orders/admin/all?${params}`);
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(); }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Orders</h1>
          <p>Manage customer orders</p>
        </div>
      </div>
      <div className="page-content">
        <div className="filter-bar">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
            {orders.length} orders
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    ⏳ Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    🛒 No orders found
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td><strong style={{ color: '#4f46e5' }}>#{order.id}</strong></td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.user_name || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.user_email}</div>
                    </div>
                  </td>
                  <td>
                    {order.items && order.items.length > 0 ? (
                      <div 
                        style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                        title={order.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')}
                      >
                        {order.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')}
                      </div>
                    ) : (
                      order.item_count || '—'
                    )}
                  </td>
                  <td><strong>₹{parseFloat(order.total_amount || 0).toLocaleString()}</strong></td>
                  <td>
                    <span className={`badge badge-${order.payment_status}`}>
                      {order.payment_status}
                    </span>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>
                      {order.payment_method || 'Online'}
                    </div>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/orders/${order.id}`} className="icon-btn icon-btn-view" title="View order details">
                        👁️
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Orders;
