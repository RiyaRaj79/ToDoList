const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabit, deleteHabit, completeHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getHabits).post(createHabit);
router.route('/:id').put(updateHabit).delete(deleteHabit);
router.post('/:id/complete', completeHabit);

module.exports = router;
