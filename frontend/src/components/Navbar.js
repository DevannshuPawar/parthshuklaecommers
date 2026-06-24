import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Navbar = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}`);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
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

          {/* Hamburger button — visible only on mobile */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && <div className="mobile-overlay" onClick={closeMenu} />}

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <form className="mobile-search" onSubmit={handleSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="mobile-nav-links">
          {user ? (
            <>
              <NavLink to="/" className="mobile-nav-item" onClick={closeMenu}>🏠 Home</NavLink>
              <NavLink to="/dashboard" className="mobile-nav-item" onClick={closeMenu}>👤 My Account</NavLink>
              <NavLink to="/cart" className="mobile-nav-item" onClick={closeMenu}>
                🛒 Cart {cartCount > 0 && <span className="cart-badge" style={{ position: 'static', marginLeft: 6 }}>{cartCount}</span>}
              </NavLink>
              <button className="mobile-nav-item mobile-logout" onClick={handleLogout}>🚪 Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/" className="mobile-nav-item" onClick={closeMenu}>🏠 Home</NavLink>
              <NavLink to="/login" className="mobile-nav-item" onClick={closeMenu}>🔑 Login</NavLink>
              <NavLink to="/register" className="mobile-nav-item mobile-register" onClick={closeMenu}>✨ Register</NavLink>
              <NavLink to="/cart" className="mobile-nav-item" onClick={closeMenu}>
                🛒 Cart {cartCount > 0 && <span className="cart-badge" style={{ position: 'static', marginLeft: 6 }}>{cartCount}</span>}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
