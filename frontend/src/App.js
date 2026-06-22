import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /></>} />
            <Route path="/cart" element={<><Navbar /><CartPage /></>} />
            <Route path="/checkout" element={
              <PrivateRoute><><Navbar /><CheckoutPage /></></PrivateRoute>
            } />
            <Route path="/order-success" element={
              <PrivateRoute><><Navbar /><OrderSuccessPage /></></PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute><><Navbar /><DashboardPage /></></PrivateRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
