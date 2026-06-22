import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem('shopkartToken');
    if (!token) { setCartItems([]); setCartCount(0); return; }
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.items || []);
      setCartCount(res.data.items?.length || 0);
    } catch {
      setCartItems([]);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('shopkartToken');
    if (!token) { toast.error('Please login to add items to cart'); return false; }
    try {
      await api.post('/cart', { product_id: productId, quantity });
      toast.success('Added to cart!');
      fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await api.put(`/cart/${cartId}`, { quantity });
      fetchCart();
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      toast.success('Item removed');
      fetchCart();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
