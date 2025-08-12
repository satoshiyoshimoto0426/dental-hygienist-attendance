import { Request, Response } from 'express';
import { HygienistModel } from '../models/Hygienist';
import { CreateHygienistInput, UpdateHygienistInput, Hygienist } from '../types/Hygienist';
import { ApiResponse, ApiError } from '../types/Api';

/**
 * 歯科衛生士コントローラー
 */
export class HygienistController {
  /**
   * 歯科衛生士一覧取得
   */
  static async getHygienists(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      
      let hygienists;
      if (search && typeof search === 'string') {
        hygienists = await HygienistModel.searchByName(search);
      } else {
        hygienists = await HygienistModel.findAll();
      }

      const response: ApiResponse<Hygienist[]> = {
        success: true,
        data: hygienists
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiError = {
        success: false,
        error: {
          code: 'HYGIENIST_FETCH_ERROR',
          message: error instanceof Error ? error.message : '歯科衛生士一覧の取得に失敗しました'
        }
      };
      res.status(500).json(response);
    }
  }

  /**
   * 歯科衛生士詳細取得
   */
  static async getHygienist(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_HYGIENIST_ID',
            message: '無効な歯科衛生士IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const hygienist = await HygienistModel.findById(id);
      
      if (!hygienist) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'HYGIENIST_NOT_FOUND',
            message: '歯科衛生士が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Hygienist> = {
        success: true,
        data: hygienist
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiError = {
        success: false,
        error: {
          code: 'HYGIENIST_FETCH_ERROR',
          message: error instanceof Error ? error.message : '歯科衛生士の取得に失敗しました'
        }
      };
      res.status(500).json(response);
    }
  }

  /**
   * 歯科衛生士作成
   */
  static async createHygienist(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateHygienistInput = req.body;
      
      const hygienist = await HygienistModel.create(input);

      const response: ApiResponse<Hygienist> = {
        success: true,
        data: hygienist
      };
      
      res.status(201).json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'HYGIENIST_CREATE_ERROR';
      
      if (error instanceof Error) {
        if (error.message.includes('バリデーションエラー')) {
          statusCode = 400;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.message.includes('既に使用されています')) {
          statusCode = 409;
          errorCode = 'DUPLICATE_STAFF_ID';
        }
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '歯科衛生士の作成に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }

  /**
   * 歯科衛生士更新
   */
  static async updateHygienist(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_HYGIENIST_ID',
            message: '無効な歯科衛生士IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const input: UpdateHygienistInput = req.body;
      const hygienist = await HygienistModel.update(id, input);
      
      if (!hygienist) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'HYGIENIST_NOT_FOUND',
            message: '歯科衛生士が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Hygienist> = {
        success: true,
        data: hygienist
      };
      
      res.json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'HYGIENIST_UPDATE_ERROR';
      
      if (error instanceof Error) {
        if (error.message.includes('バリデーションエラー')) {
          statusCode = 400;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.message.includes('既に使用されています')) {
          statusCode = 409;
          errorCode = 'DUPLICATE_STAFF_ID';
        }
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '歯科衛生士の更新に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }

  /**
   * 歯科衛生士削除
   */
  static async deleteHygienist(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'INVALID_HYGIENIST_ID',
            message: '無効な歯科衛生士IDです'
          }
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await HygienistModel.delete(id);
      
      if (!deleted) {
        const response: ApiError = {
          success: false,
          error: {
            code: 'HYGIENIST_NOT_FOUND',
            message: '歯科衛生士が見つかりません'
          }
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: '歯科衛生士を削除しました' }
      };
      
      res.json(response);
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'HYGIENIST_DELETE_ERROR';
      
      if (error instanceof Error && (error.message.includes('訪問記録が存在する') || error.message.includes('ユーザーアカウント'))) {
        statusCode = 400;
        errorCode = 'HYGIENIST_HAS_RECORDS';
      }

      const response: ApiError = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : '歯科衛生士の削除に失敗しました'
        }
      };
      res.status(statusCode).json(response);
    }
  }
}