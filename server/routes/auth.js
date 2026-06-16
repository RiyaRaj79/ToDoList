const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register, login, refreshToken, getMe, updateMe, googleCallback, logFocusSession,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validate');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);

// Google OAuth routes (only active if Google credentials configured)
router.get('/google', (req, res, next) => {
  if (process.env.GOOGLE_CLIENT_ID === 'disabled') {
    return res.status(501).json({ success: false, message: 'Google OAuth not configured on this server' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (process.env.GOOGLE_CLIENT_ID === 'disabled') {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_not_configured`);
    }
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` })(req, res, next);
  },
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/focus-session', protect, logFocusSession);

module.exports = router;
