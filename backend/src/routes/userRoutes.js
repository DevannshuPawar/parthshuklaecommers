const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, toggleUserStatus } = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, getAllUsers);
router.get('/:id', adminAuth, getUserById);
router.patch('/:id/toggle-status', adminAuth, toggleUserStatus);

module.exports = router;
