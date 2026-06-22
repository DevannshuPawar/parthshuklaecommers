const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getAllProductsAdmin, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/admin/all', adminAuth, getAllProductsAdmin);
router.get('/:id', getProduct);
router.post('/', adminAuth, upload.single('image'), createProduct);
router.put('/:id', adminAuth, upload.single('image'), updateProduct);
router.delete('/:id', adminAuth, deleteProduct);
router.post('/:id/reviews', auth, upload.array('images', 5), addReview);

module.exports = router;
