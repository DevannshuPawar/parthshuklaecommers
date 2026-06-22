const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getCart);
router.post('/', auth, addToCart);
router.put('/:id', auth, updateCartItem);
router.delete('/clear', auth, clearCart);
router.delete('/:id', auth, removeFromCart);

module.exports = router;
