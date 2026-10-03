const express = require('express');
const router = express.Router();
const { analyticsController } = require('../controllers');
const { protect } = require('../middleware');

// POST /api/analytics/search - Log a search query (PUBLIC / PROTECTED)
router.post('/search', analyticsController.logSearch);

// GET /api/analytics/demand - General search demand insights (PUBLIC / ADMIN)
router.get('/demand', analyticsController.getDemandAnalytics);

// GET /api/analytics/shopkeeper - Shopkeeper-specific forecast and stock (PROTECTED)
router.get('/shopkeeper', protect, analyticsController.getShopkeeperInsights);

module.exports = router;
