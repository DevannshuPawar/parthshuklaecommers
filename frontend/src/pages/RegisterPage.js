import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      fetchCart();
      toast.success('Account created! Welcome aboard!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>Create Account</h2>
        <p style={{color:'#6b7280',marginBottom:24,fontSize:14}}>Join ShopKart and start shopping</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.48C1.61 2.33 2.28 1.61 3.43 1.61H6.43C7.43 1.61 8.27 2.33 8.43 3.31c.27 1.57.77 3.1 1.49 4.55a2 2 0 0 1-.45 2.11L8.09 11.35a16 16 0 0 0 5.56 5.56l1.69-1.69a2 2 0 0 1 2.11-.45c1.45.72 2.98 1.22 4.55 1.49.99.16 1.71 1 1.71 2.06z"/></svg>
              <input type="tel" className="form-input" placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength="6" />
            </div>
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Creating...' : '🚀 Create Account'}</button>
          <div className="auth-footer">Already have an account? <a href="/login">Login</a></div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
