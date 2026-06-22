import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginForm);
      if (res.data.user.role === 'admin') {
        toast.error('Please use the admin panel to login');
        return;
      }
      login(res.data.token, res.data.user);
      fetchCart();
      toast.success('Welcome back, ' + res.data.user.name + '!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', regForm);
      login(res.data.token, res.data.user);
      fetchCart();
      toast.success('Account created! Welcome, ' + res.data.user.name + '!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(res.data.message || 'OTP sent successfully!');
      setActiveTab('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp,
        password: newPassword
      });
      toast.success(res.data.message || 'Password reset successful!');
      setActiveTab('login');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-badge" style={{width:44,height:44,background:'linear-gradient(135deg,#4F46E5,#7C3AED)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🛒</div>
          <h2>ShopKart</h2>
        </div>

        {(activeTab === 'login' || activeTab === 'register') ? (
          <div className="auth-tabs">
            <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</button>
            <button className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Register</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 20, color: '#4F46E5', fontWeight: 600, fontSize: 18 }}>
            {activeTab === 'forgot' ? '🔒 Forgot Password' : '🔑 Reset Password'}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="form-input" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" className="form-input" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              </div>
              <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); setActiveTab('forgot'); setForgotEmail(loginForm.email); }}>Forgot Password?</a>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Logging in...' : '🔑 Login'}</button>
            <div className="auth-footer">Don't have an account? <a href="#register" onClick={() => setActiveTab('register')}>Register</a></div>
          </form>
        ) : activeTab === 'forgot' ? (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="form-input" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Sending OTP...' : '✉️ Send OTP'}</button>
            <div className="auth-footer"><a href="#login" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Back to Login</a></div>
          </form>
        ) : activeTab === 'reset' ? (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="form-input" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required disabled />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">OTP Verification Code</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <input type="text" className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required maxLength="6" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" className="form-input" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" />
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Resetting...' : '🔒 Reset Password'}</button>
            <div className="auth-footer"><a href="#login" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Back to Login</a></div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" className="form-input" placeholder="Your full name" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="form-input" placeholder="you@example.com" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.48C1.61 2.33 2.28 1.61 3.43 1.61H6.43C7.43 1.61 8.27 2.33 8.43 3.31c.27 1.57.77 3.1 1.49 4.55a2 2 0 0 1-.45 2.11L8.09 11.35a16 16 0 0 0 5.56 5.56l1.69-1.69a2 2 0 0 1 2.11-.45c1.45.72 2.98 1.22 4.55 1.49.99.16 1.71 1 1.71 2.06z"/></svg>
                <input type="tel" className="form-input" placeholder="10-digit phone" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" className="form-input" placeholder="Min. 6 characters" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required minLength="6" />
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Creating account...' : '🚀 Create Account'}</button>
            <div className="auth-footer">Already have an account? <a href="#login" onClick={() => setActiveTab('login')}>Login</a></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
