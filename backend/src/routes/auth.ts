import { Router } from 'express';
import { login, logout, verifyToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * ログイン
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * ログアウト
 */
router.post('/logout', logout);

/**
 * GET /api/auth/verify
 * トークン検証
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;