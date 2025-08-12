import { Request, Response } from 'express';
import { UserModel } from '../models/User';

import { generateToken, comparePassword } from '../utils/auth';
import { validateLoginInput } from '../utils/validation';

/**
 * ログイン処理
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // 入力値のバリデーション
    const { error, value } = validateLoginInput(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラー',
          details: error.details,
        },
      });
      return;
    }

    const { username, password } = value;

    // ユーザーの存在確認（パスワードハッシュ付き）
    const userRow = await UserModel.findByUsernameWithPassword(username);
    if (!userRow) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ユーザー名またはパスワードが正しくありません',
        },
      });
      return;
    }

    // パスワードの検証
    const isPasswordValid = await comparePassword(password, userRow.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ユーザー名またはパスワードが正しくありません',
        },
      });
      return;
    }

    // JWTトークンの生成
    const payload: any = {
      userId: userRow.id,
      username: userRow.username,
      role: userRow.role,
    };
    
    if (userRow.hygienist_id) {
      payload.hygienistId = userRow.hygienist_id;
    }
    
    const token = generateToken(payload);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userRow.id,
          username: userRow.username,
          role: userRow.role,
          hygienistId: userRow.hygienist_id,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
      },
    });
  }
};

/**
 * ログアウト処理
 * JWTはステートレスなので、クライアント側でトークンを削除するだけ
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'ログアウトしました',
  });
};

/**
 * トークン検証処理
 * 現在のトークンが有効かどうかを確認
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
      return;
    }

    // ユーザー情報を再取得して最新の状態を確認
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ユーザーが見つかりません',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          hygienistId: user.hygienistId,
        },
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
      },
    });
  }
};