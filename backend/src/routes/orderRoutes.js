const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPaymentAndCreateOrder, createCodOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/razorpay', auth, createRazorpayOrder);
router.post('/verify', auth, verifyPaymentAndCreateOrder);
router.post('/cod', auth, createCodOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/admin/all', adminAuth, getAllOrders);
router.put('/admin/:id/status', adminAuth, updateOrderStatus);
router.patch('/admin/:id/status', adminAuth, updateOrderStatus);
router.put('/:id/status', adminAuth, updateOrderStatus);
router.patch('/:id/status', adminAuth, updateOrderStatus);
router.get('/:id', auth, getOrder);

module.exports = router;
