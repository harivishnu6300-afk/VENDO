const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById
} = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
