import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient';
import { CreatePatientInput, UpdatePatientInput, Patient } from '../types/Patient';
import { ApiResponse, ApiError } from '../types/Api';

/**
 * 患者コントローラー
 */
export class PatientController {
  /**
   * 患者一覧取得
   */
  static async getPatients(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      
      let patients;
      if (search && typeof search === 'string') {
        patients = await PatientModel.searchByName(search);
      } else {
        patients = await PatientModel.findAll();
      }

      const response: ApiResponse<Patient[]> = {
        success: true,
        data: patients
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiError = {
        success: false,
        error: {
          code: 'PATIENT_FETCH_ERROR',
          message: error instanceof Error ? error.message : '患者一覧の取得に失敗しました'
        }
      };
      res.status(500).json(response);
    }
  }

  /**
   * 患者詳細取得
   */
  static async getPatient(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_PATIENT_ID',
            message: '無効な患者IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const patient = await PatientModel.findById(id);
      
      if (!patient) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: '患者が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Patient> = {
        success: true,
        data: patient
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiError = {
        success: false,
        error: {
          code: 'PATIENT_FETCH_ERROR',
          message: error instanceof Error ? error.message : '患者の取得に失敗しました'
        }
      };
      res.status(500).json(response);
    }
  }

  /**
   * 患者作成
   */
  static async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const input: CreatePatientInput = req.body;
      
      const patient = await PatientModel.create(input);

      const response: ApiResponse<Patient> = {
        success: true,
        data: patient
      };
      
      res.status(201).json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'PATIENT_CREATE_ERROR';
      
      if (error instanceof Error) {
        if (error.message.includes('バリデーションエラー')) {
          statusCode = 400;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.message.includes('既に使用されています')) {
          statusCode = 409;
          errorCode = 'DUPLICATE_PATIENT_ID';
        }
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '患者の作成に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }

  /**
   * 患者更新
   */
  static async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_PATIENT_ID',
            message: '無効な患者IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const input: UpdatePatientInput = req.body;
      const patient = await PatientModel.update(id, input);
      
      if (!patient) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: '患者が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Patient> = {
        success: true,
        data: patient
      };
      
      res.json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'PATIENT_UPDATE_ERROR';
      
      if (error instanceof Error) {
        if (error.message.includes('バリデーションエラー')) {
          statusCode = 400;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.message.includes('既に使用されています')) {
          statusCode = 409;
          errorCode = 'DUPLICATE_PATIENT_ID';
        }
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '患者の更新に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }

  /**
   * 患者削除
   */
  static async deletePatient(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_PATIENT_ID',
            message: '無効な患者IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await PatientModel.delete(id);
      
      if (!deleted) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: '患者が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: '患者を削除しました' }
      };
      
      res.json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'PATIENT_DELETE_ERROR';
      
      if (error instanceof Error && error.message.includes('訪問記録が存在する')) {
        statusCode = 400;
        errorCode = 'PATIENT_HAS_RECORDS';
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '患者の削除に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }
}