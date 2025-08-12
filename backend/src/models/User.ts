import { pool } from '../database/connection';
import { User as UserType, CreateUserInput, UpdateUserInput, UserRow } from '../types/User';
import { validateUserData, formatValidationError } from '../utils/validation';
import { hashPassword } from '../utils/auth';

/**
 * ユーザーモデルクラス
 */
export class UserModel {
  /**
   * データベース行を User オブジェクトに変換
   */
  private static rowToUser(row: UserRow): UserType {
    const user: UserType = {
      id: row.id,
      username: row.username,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    if (row.hygienist_id !== null && row.hygienist_id !== undefined) {
      user.hygienistId = row.hygienist_id;
    }
    
    return user;
  }

  /**
   * 全ユーザーを取得
   */
  static async findAll(): Promise<UserType[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return result.rows.map(this.rowToUser);
    } catch (error) {
      throw new Error(`ユーザー一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * IDでユーザーを取得
   */
  static async findById(id: number): Promise<UserType | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToUser(result.rows[0]);
    } catch (error) {
      throw new Error(`ユーザーの取得に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザー名でユーザーを取得
   */
  static async findByUsername(username: string): Promise<UserType | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToUser(result.rows[0]);
    } catch (error) {
      throw new Error(`ユーザーの取得に失敗しました: ${error}`);
    }
  }

  /**
   * パスワードハッシュを含むユーザーを取得（認証用）
   */
  static async findByUsernameWithPassword(username: string): Promise<UserRow | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`ユーザーの取得に失敗しました: ${error}`);
    }
  }



  /**
   * ユーザーを作成
   */
  static async create(input: CreateUserInput): Promise<UserType> {
    // バリデーション
    const { error } = validateUserData(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // ユーザー名の重複チェック
      const existing = await this.findByUsername(input.username);
      if (existing) {
        throw new Error('このユーザー名は既に使用されています');
      }

      // 歯科衛生士IDが指定されている場合の存在確認
      if (input.hygienistId) {
        const hygienistCheck = await pool.query('SELECT id FROM hygienists WHERE id = $1', [input.hygienistId]);
        if (hygienistCheck.rows.length === 0) {
          throw new Error('指定された歯科衛生士が存在しません');
        }
      }

      // パスワードをハッシュ化
      const passwordHash = await hashPassword(input.password);

      const result = await pool.query(`
        INSERT INTO users (username, password_hash, role, hygienist_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [
        input.username,
        passwordHash,
        input.role || 'user',
        input.hygienistId
      ]);
      
      return this.rowToUser(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('ユーザー名') || error.message.includes('歯科衛生士'))) {
        throw error;
      }
      throw new Error(`ユーザーの作成に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザーを更新
   */
  static async update(id: number, input: UpdateUserInput): Promise<UserType | null> {
    try {
      // ユーザーの存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // ユーザー名の重複チェック（自分以外）
      if (input.username) {
        const duplicateCheck = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [input.username, id]
        );
        if (duplicateCheck.rows.length > 0) {
          throw new Error('このユーザー名は既に使用されています');
        }
      }

      // 歯科衛生士IDが指定されている場合の存在確認
      if (input.hygienistId) {
        const hygienistCheck = await pool.query('SELECT id FROM hygienists WHERE id = $1', [input.hygienistId]);
        if (hygienistCheck.rows.length === 0) {
          throw new Error('指定された歯科衛生士が存在しません');
        }
      }

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.username !== undefined) {
        updateFields.push(`username = $${paramIndex++}`);
        values.push(input.username);
      }
      if (input.password !== undefined) {
        // パスワードをハッシュ化
        const passwordHash = await hashPassword(input.password);
        updateFields.push(`password_hash = $${paramIndex++}`);
        values.push(passwordHash);
      }
      if (input.role !== undefined) {
        updateFields.push(`role = $${paramIndex++}`);
        values.push(input.role);
      }
      if (input.hygienistId !== undefined) {
        updateFields.push(`hygienist_id = $${paramIndex++}`);
        values.push(input.hygienistId);
      }

      if (updateFields.length === 0) {
        return existing; // 更新するフィールドがない場合は既存データを返す
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return this.rowToUser(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('ユーザー名') || error.message.includes('歯科衛生士'))) {
        throw error;
      }
      throw new Error(`ユーザーの更新に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザーを削除
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // ユーザーの存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      const result = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      throw new Error(`ユーザーの削除に失敗しました: ${error}`);
    }
  }


}