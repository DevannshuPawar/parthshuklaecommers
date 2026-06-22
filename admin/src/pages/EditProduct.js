import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    status: 'active'
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/categories/admin/all'),
      api.get(`/products/${id}`)
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.categories || []);
      const p = prodRes.data.product;
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        stock: p.stock || '',
        category_id: p.category_id || '',
        status: p.status || 'active'
      });
      if (p.image) {
        setPreview(p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`);
      }
    }).catch(() => {
      toast.error('Failed to load product');
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);
      await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product updated successfully! ✅');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>⏳ Loading product...</div>
    </div>
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Edit Product</h1>
          <p>Update product details</p>
        </div>
      </div>
      <div className="page-content">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category_id}
                  onChange={e => setForm({...form, category_id: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div className="form-group full">
                <label className="form-label">Product Image</label>
                <label className="image-upload-area">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>Click to change image</p>
                  <span>PNG, JPG, GIF, WebP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                </label>
                {preview && (
                  <img src={preview} alt="Preview" className="product-image-preview" />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/products')}
              >
                ✖ Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Updating...' : '✅ Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProduct;
