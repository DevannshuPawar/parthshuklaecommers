import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/admin/all');
      setCategories(res.data.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAddModal = () => {
    setEditItem(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/categories/${editItem.id}`, form);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', form);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const CATEGORY_ICONS = ['🛍️', '👗', '📱', '🏠', '🍕', '🎮', '📚', '⚽', '💄', '🚗'];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{categories.length} categories total</div>
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Add Category
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>⏳ Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>🏷️ No categories yet. Add one!</div>
        ) : (
          <div className="category-grid">
            {categories.map((cat, i) => (
              <div key={cat.id} className="category-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    {CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
                  </div>
                  <div>
                    <div className="category-name">{cat.name}</div>
                    {cat.description && (
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        {cat.description.substring(0, 30)}{cat.description.length > 30 ? '...' : ''}
                      </div>
                    )}
                    {cat.product_count !== undefined && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {cat.product_count} products
                      </div>
                    )}
                  </div>
                </div>
                <div className="category-actions">
                  <button className="icon-btn icon-btn-edit" onClick={() => openEditModal(cat)} title="Edit">✏️</button>
                  <button className="icon-btn icon-btn-delete" onClick={() => deleteCategory(cat.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Category' : '➕ Add Category'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Electronics"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Optional category description..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : (editItem ? '✅ Update' : '✅ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
