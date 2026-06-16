const express = require('express');
const router = express.Router();
const { chat, generateSubtasks, suggestPriority, getDailyPlan, getInsights, getQuote, getTip } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/chat', chat);
router.post('/subtasks', generateSubtasks);
router.post('/suggest-priority', suggestPriority);
router.get('/daily-plan', getDailyPlan);
router.post('/insights', getInsights);
router.get('/quote', getQuote);
router.get('/tip', getTip);

module.exports = router;
