import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 全てのルートに認証を適用
router.use(authenticateToken);

/**
 * 患者一覧取得
 * GET /api/patients
 * クエリパラメータ:
 * - search: 患者名での検索（部分一致）
 */
router.get('/', PatientController.getPatients);

/**
 * 患者詳細取得
 * GET /api/patients/:id
 */
router.get('/:id', PatientController.getPatient);

/**
 * 患者作成
 * POST /api/patients
 * Body: CreatePatientInput
 */
router.post('/', PatientController.createPatient);

/**
 * 患者更新
 * PUT /api/patients/:id
 * Body: UpdatePatientInput
 */
router.put('/:id', PatientController.updatePatient);

/**
 * 患者削除
 * DELETE /api/patients/:id
 */
router.delete('/:id', PatientController.deletePatient);

export default router;