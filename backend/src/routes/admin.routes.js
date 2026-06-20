const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/admin.controller');
const { protect, adminOrHR } = require('../middleware/auth.middleware');

router.get('/insights', protect, adminOrHR, getInsights);

module.exports = router;
