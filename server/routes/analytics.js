const express = require('express');
const router = express.Router();
const { getAnalytics, getProductivityScore, getStreaks } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAnalytics);
router.get('/productivity-score', getProductivityScore);
router.get('/streaks', getStreaks);

module.exports = router;
