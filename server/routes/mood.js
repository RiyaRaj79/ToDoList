const express = require('express');
const router = express.Router();
const { getMoodEntries, logMood, getMoodTrend } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getMoodEntries).post(logMood);
router.get('/trend', getMoodTrend);

module.exports = router;
