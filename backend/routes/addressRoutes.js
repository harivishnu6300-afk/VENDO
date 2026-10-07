const express = require('express');
const router = express.Router();
const {
  getAddresses,
  createAddress,
  deleteAddress
} = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
