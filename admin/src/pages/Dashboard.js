import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const StatCard = ({ icon, label, value, change, bg }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div>
        <h3>{label}</h3>
        <div className="stat-value">{value}</div>
        <div className="stat-change up">{change}</div>
      </div>
      <div className="stat-icon" style={{ background: bg }}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  );

  const orderStatusData = stats ? [
    { name: 'Pending', value: stats.orderStatus?.pending || 0, color: '#f59e0b' },
    { name: 'Confirmed', value: stats.orderStatus?.confirmed || 0, color: '#3b82f6' },
    { name: 'Packed', value: stats.orderStatus?.packed || 0, color: '#8b5cf6' },
    { name: 'Out for Delivery', value: stats.orderStatus?.out_for_delivery || 0, color: '#06b6d4' },
    { name: 'Delivered', value: stats.orderStatus?.delivered || 0, color: '#10b981' },
    { name: 'Cancelled', value: stats.orderStatus?.cancelled || 0, color: '#ef4444' },
  ] : [];

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening.</p>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" title="Notifications">🔔</button>
          <button className="topbar-btn" title="Profile">👤</button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <StatCard
            icon="👥"
            label="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            change="↑ 15.5% this month"
            bg="#ede9fe"
          />
          <StatCard
            icon="📦"
            label="Total Products"
            value={stats?.totalProducts?.toLocaleString() || '0'}
            change="↑ 8.1% this month"
            bg="#dbeafe"
          />
          <StatCard
            icon="🛒"
            label="Total Orders"
            value={stats?.totalOrders?.toLocaleString() || '0'}
            change="↑ 15.2% this month"
            bg="#d1fae5"
          />
          <StatCard
            icon="💰"
            label="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            change="↑ 12.5% this month"
            bg="#fef3c7"
          />
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>📈 Orders Overview</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats?.monthlyOrders || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 4 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>🛒 Order Status</h3>
            <div style={{ marginTop: 8 }}>
              {orderStatusData.map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }}></span>
                    {s.name}
                  </span>
                  <strong style={{ color: '#1e1b4b' }}>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 && (
          <div className="table-card" style={{ marginTop: 24 }}>
            <div className="table-header">
              <h2>🕐 Recent Orders</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.user_name || 'N/A'}</td>
                    <td>₹{parseFloat(order.total_amount || 0).toLocaleString()}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
