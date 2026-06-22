import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => { 
        setProduct(res.data.product); 
        if (res.data.product.images && res.data.product.images.length > 0) {
          setActiveImage(res.data.product.images[0]);
        } else {
          setActiveImage(res.data.product.image);
        }
        setLoading(false); 
      })
      .catch(() => { toast.error('Product not found'); navigate('/'); });
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  if (!product) return null;

  const imgSrc = product.image?.startsWith('http') ? product.image : `http://localhost:5000${product.image}`;

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) toast.success('Added to cart!');
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) navigate('/cart');
  };

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{product.category_name}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        <div className="product-detail-images">
          <img
            src={activeImage?.startsWith('http') ? activeImage : `http://localhost:5000${activeImage}`}
            alt={product.name}
            className="product-main-img"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x340?text=No+Image'; }}
          />
          <div className="product-carousel-thumbnails" style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {product.images?.map((img, i) => {
              const thumbSrc = img.startsWith('http') ? img : `http://localhost:5000${img}`;
              const isActive = activeImage === img;
              return (
                <img 
                  key={i} 
                  src={thumbSrc} 
                  alt="" 
                  onClick={() => setActiveImage(img)}
                  style={{ 
                    width: 60, 
                    height: 60, 
                    objectFit: 'cover', 
                    borderRadius: 8, 
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'border 0.2s'
                  }} 
                />
              );
            })}
          </div>
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          
          {product.rating_stats && (
            <div className="product-rating-summary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: '#f59e0b', fontSize: 18 }}>
                {'★'.repeat(Math.round(product.rating_stats.average_rating))}
                {'☆'.repeat(5 - Math.round(product.rating_stats.average_rating))}
              </span>
              <strong style={{ fontSize: 14 }}>{product.rating_stats.average_rating || '0.0'} / 5</strong>
              <span style={{ color: 'var(--text-light)', fontSize: 12 }}>
                ({product.rating_stats.total_reviews} {product.rating_stats.total_reviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} left)` : '❌ Out of Stock'}
          </span>

          <div className="product-detail-price">₹{parseFloat(product.price).toLocaleString()}</div>

          <p className="product-detail-desc">{product.description}</p>

          {product.stock > 0 && (
            <>
              <div className="qty-selector">
                <label>Quantity</label>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <div className="qty-display">{quantity}</div>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>

              <div className="product-actions">
                <button className="btn-add-cart" onClick={handleAddToCart}>🛒 Add to Cart</button>
                <button className="btn-buy-now" onClick={handleBuyNow}>⚡ Buy Now</button>
              </div>
            </>
          )}

          <div style={{ marginTop: 20, padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-light)' }}>
            <div>🚚 Free delivery on orders above ₹499</div>
            <div style={{ marginTop: 4 }}>🔄 7-day easy returns</div>
            <div style={{ marginTop: 4 }}>🛡️ Secure payment via Razorpay</div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="reviews-section" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 30 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#1e1b4b' }}>Customer Reviews</h2>
        
        {(!product.reviews || product.reviews.length === 0) ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)', background: 'var(--bg)', borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 14 }}>💬 No reviews for this product yet.</p>
          </div>
        ) : (
          <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {product.reviews.map(review => (
              <div key={review.id} className="review-card" style={{ padding: 20, border: '1px solid var(--border)', borderRadius: 12, background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: '#1f2937' }}>{review.user_name}</strong>
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Verified Purchaser</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <span style={{ color: '#f59e0b', fontSize: 14 }}>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5, margin: '0 0 12px 0' }}>{review.comment}</p>
                
                {review.images && review.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {review.images.map((img, idx) => {
                      const rImgSrc = img.startsWith('http') ? img : `http://localhost:5000${img}`;
                      return (
                        <a key={idx} href={rImgSrc} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={rImgSrc} 
                            alt="" 
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', cursor: 'zoom-in' }} 
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
