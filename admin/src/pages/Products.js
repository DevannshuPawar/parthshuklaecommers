import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/admin/all?search=${search}`);
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchProducts(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Products</h1>
          <p>Manage your product catalog</p>
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
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
            {products.length} products
          </div>
          <Link to="/products/add" className="btn btn-primary">
            ➕ Add Product
          </Link>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    ⏳ Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    📦 No products found
                  </td>
                </tr>
              ) : products.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <img
                      src={p.image?.startsWith('http') ? p.image : `http://localhost:5000${p.image}`}
                      alt={p.name}
                      className="product-img"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/44x44?text=No+Img'; }}
                    />
                  </td>
                  <td>
                    <div>
                      <strong>{p.name}</strong>
                      {p.description && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {p.description.substring(0, 40)}{p.description.length > 40 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td><strong style={{ color: '#1e1b4b' }}>₹{parseFloat(p.price).toLocaleString()}</strong></td>
                  <td>
                    <span style={{ color: p.stock < 10 ? '#ef4444' : '#374151', fontWeight: p.stock < 10 ? 700 : 400 }}>
                      {p.stock}
                      {p.stock < 10 && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠️</span>}
                    </span>
                  </td>
                  <td>{p.category_name || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/products/edit/${p.id}`} className="icon-btn icon-btn-edit" title="Edit product">
                        ✏️
                      </Link>
                      <button className="icon-btn icon-btn-delete" onClick={() => deleteProduct(p.id)} title="Delete product">
                        🗑️
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

export default Products;
