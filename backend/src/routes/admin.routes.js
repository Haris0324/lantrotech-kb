const express = require('express');
const router = express.Router();
const { getInsights, getTags, createTag, updateTag, deleteTag } = require('../controllers/admin.controller');
const { protect, adminOrHR } = require('../middleware/auth.middleware');

router.get('/insights', protect, adminOrHR, getInsights);
router.get('/tags', protect, adminOrHR, getTags);
router.post('/tags', protect, adminOrHR, createTag);
router.put('/tags/:id', protect, adminOrHR, updateTag);
router.delete('/tags/:id', protect, adminOrHR, deleteTag);

module.exports = router;
