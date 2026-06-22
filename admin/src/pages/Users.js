import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${search}`);
      setUsers(res.data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      toast.success('User status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Users</h1>
          <p>Manage registered customers</p>
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
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
            {users.length} users found
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    ⏳ Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    👥 No users found
                  </td>
                </tr>
              ) : users.map((user, i) => (
                <tr key={user.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td>{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${user.status}`}>
                      <span className={`status-dot dot-${user.status}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className={`icon-btn ${user.status === 'active' ? 'icon-btn-delete' : 'icon-btn-edit'}`}
                        onClick={() => toggleStatus(user.id)}
                        title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.status === 'active' ? '🚫' : '✅'}
                      </button>
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

export default Users;
