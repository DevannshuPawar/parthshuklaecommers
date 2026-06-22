import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import { toast } from 'react-toastify';

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data.stats))
      .catch(() => toast.error('Failed to load report data'))
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>⏳ Loading reports...</div>
    </div>
  );

  const orderStatusData = data ? [
    { name: 'Pending', value: data.orderStatus?.pending || 0 },
    { name: 'Confirmed', value: data.orderStatus?.confirmed || 0 },
    { name: 'Packed', value: data.orderStatus?.packed || 0 },
    { name: 'Out for Delivery', value: data.orderStatus?.out_for_delivery || 0 },
    { name: 'Delivered', value: data.orderStatus?.delivered || 0 },
    { name: 'Cancelled', value: data.orderStatus?.cancelled || 0 },
  ] : [];

  const revenueData = data?.monthlyOrders || [];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Reports</h1>
          <p>Business analytics and insights</p>
        </div>
        <div className="topbar-actions">
          <select
            className="filter-select"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>
      <div className="page-content">
        {/* Key Metrics */}
        <div className="reports-grid">
          <div className="report-stat-card">
            <h3>📦 TOTAL ORDERS</h3>
            <div className="value">{data?.totalOrders?.toLocaleString() || 0}</div>
            <div className="change">↑ 15.2% vs last period</div>
          </div>
          <div className="report-stat-card">
            <h3>💰 TOTAL REVENUE</h3>
            <div className="value">₹{(data?.totalRevenue || 0).toLocaleString()}</div>
            <div className="change">↑ 12.5% vs last period</div>
          </div>
          <div className="report-stat-card">
            <h3>👥 TOTAL USERS</h3>
            <div className="value">{data?.totalUsers?.toLocaleString() || 0}</div>
            <div className="change">↑ 15.5% vs last period</div>
          </div>
          <div className="report-stat-card">
            <h3>✅ DELIVERED</h3>
            <div className="value">{data?.orderStatus?.delivered || 0}</div>
            <div className="change" style={{ color: '#10b981' }}>Fulfilled orders</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="charts-grid" style={{ marginBottom: 24 }}>
          <div className="chart-card">
            <h3>📈 Monthly Orders Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
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
            <h3>🥧 Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={orderStatusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        {revenueData.length > 0 && (
          <div className="chart-card">
            <h3>📊 Monthly Orders Bar Chart</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Status Table */}
        <div className="table-card" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h2>📋 Order Status Breakdown</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {orderStatusData.map((s, i) => {
                const total = orderStatusData.reduce((sum, x) => sum + x.value, 0);
                const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : 0;
                return (
                  <tr key={s.name}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }}></span>
                        <span className={`badge badge-${s.name.toLowerCase().replace(/ /g, '_')}`}>{s.name}</span>
                      </span>
                    </td>
                    <td><strong>{s.value}</strong></td>
                    <td>{pct}%</td>
                    <td>
                      <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6, width: 120 }}>
                        <div style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 99,
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Reports;
