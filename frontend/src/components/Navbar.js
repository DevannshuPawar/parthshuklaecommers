import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Navbar = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-badge">🛒</div>
          ShopKart
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-btn">👤 {user.name?.split(' ')[0]}</NavLink>
              <NavLink to="/cart" className="nav-btn cart-btn">
                🛒 Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
              <button className="nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-btn">Login</NavLink>
              <Link to="/register" className="nav-btn" style={{ background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>Register</Link>
              <NavLink to="/cart" className="nav-btn cart-btn">
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
