import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : `http://localhost:5000${product.image}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <div className="product-img-wrap">
          <img
            src={imgSrc}
            alt={product.name}
            className="product-card-img"
            onError={e => { e.target.src = 'https://via.placeholder.com/220x180?text=No+Image'; }}
          />
        </div>
        <div className="product-card-body">
          <div className="product-card-name">{product.name}</div>
          <div className="product-card-price">₹{parseFloat(product.price).toLocaleString()}</div>
          <div className="product-rating">
            ⭐⭐⭐⭐<span style={{ color: '#d1d5db' }}>⭐</span>
            <span style={{ color: '#6b7280', marginLeft: 4 }}>(4.2)</span>
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 16px 16px' }}>
        {product.stock > 0 ? (
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
        ) : (
          <button className="add-to-cart-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
