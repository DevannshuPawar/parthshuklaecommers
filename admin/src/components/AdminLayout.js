import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🛍️</div>
          <div>
            <h2>AdminPanel</h2>
            <span>ShopKart Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main</div>
          <NavLink to="/dashboard">📊 Dashboard</NavLink>
          <NavLink to="/users">👥 Users</NavLink>
          <NavLink to="/products">📦 Products</NavLink>
          <NavLink to="/orders">🛒 Orders</NavLink>
          <NavLink to="/categories">🏷️ Categories</NavLink>
          <div className="nav-section-title" style={{marginTop: 12}}>Analytics</div>
          <NavLink to="/reports">📈 Reports</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">{admin?.name?.[0] || 'A'}</div>
            <div className="admin-info-text">
              <div className="name">{admin?.name || 'Admin'}</div>
              <div className="role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
