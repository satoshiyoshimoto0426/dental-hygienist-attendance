import { Router } from 'express';
import { HygienistController } from '../controllers/hygienistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 全てのルートに認証を適用
router.use(authenticateToken);

/**
 * 歯科衛生士一覧取得
 * GET /api/hygienists
 * クエリパラメータ:
 * - search: 歯科衛生士名での検索（部分一致）
 */
router.get('/', HygienistController.getHygienists);

/**
 * 歯科衛生士詳細取得
 * GET /api/hygienists/:id
 */
router.get('/:id', HygienistController.getHygienist);

/**
 * 歯科衛生士作成
 * POST /api/hygienists
 * Body: CreateHygienistInput
 */
router.post('/', HygienistController.createHygienist);

/**
 * 歯科衛生士更新
 * PUT /api/hygienists/:id
 * Body: UpdateHygienistInput
 */
router.put('/:id', HygienistController.updateHygienist);

/**
 * 歯科衛生士削除
 * DELETE /api/hygienists/:id
 */
router.delete('/:id', HygienistController.deleteHygienist);

export default router;