import { Router } from 'express';
import { register, login, refreshToken, logout, getMe, forgotPassword, verifyOtp, resetPassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
