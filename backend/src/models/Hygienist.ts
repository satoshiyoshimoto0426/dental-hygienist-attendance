import { pool } from '../database/connection';
import { Hygienist, CreateHygienistInput, UpdateHygienistInput, HygienistRow } from '../types/Hygienist';
import { hygienistValidationSchema, formatValidationError } from '../utils/validation';

/**
 * 歯科衛生士モデルクラス
 */
export class HygienistModel {
  /**
   * データベース行を Hygienist オブジェクトに変換
   */
  private static rowToHygienist(row: HygienistRow): Hygienist {
    const hygienist: Hygienist = {
      id: row.id,
      staffId: row.staff_id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    if (row.license_number) {
      hygienist.licenseNumber = row.license_number;
    }
    if (row.phone) {
      hygienist.phone = row.phone;
    }
    if (row.email) {
      hygienist.email = row.email;
    }

    return hygienist;
  }

  /**
   * 全歯科衛生士を取得
   */
  static async findAll(): Promise<Hygienist[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM hygienists ORDER BY created_at DESC'
      );
      return result.rows.map(this.rowToHygienist);
    } catch (error) {
      throw new Error(`歯科衛生士一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * IDで歯科衛生士を取得
   */
  static async findById(id: number): Promise<Hygienist | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM hygienists WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToHygienist(result.rows[0]);
    } catch (error) {
      throw new Error(`歯科衛生士の取得に失敗しました: ${error}`);
    }
  }

  /**
   * スタッフIDで歯科衛生士を取得
   */
  static async findByStaffId(staffId: string): Promise<Hygienist | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM hygienists WHERE staff_id = $1',
        [staffId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToHygienist(result.rows[0]);
    } catch (error) {
      throw new Error(`歯科衛生士の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士を作成
   */
  static async create(input: CreateHygienistInput): Promise<Hygienist> {
    // バリデーション
    const { error } = hygienistValidationSchema.create.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // スタッフIDの重複チェック
      const existing = await this.findByStaffId(input.staffId);
      if (existing) {
        throw new Error('このスタッフIDは既に使用されています');
      }

      const result = await pool.query(
        `INSERT INTO hygienists (staff_id, name, license_number, phone, email) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [input.staffId, input.name, input.licenseNumber, input.phone, input.email]
      );
      
      return this.rowToHygienist(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('スタッフID')) {
        throw error;
      }
      throw new Error(`歯科衛生士の作成に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士を更新
   */
  static async update(id: number, input: UpdateHygienistInput): Promise<Hygienist | null> {
    // バリデーション
    const { error } = hygienistValidationSchema.update.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 歯科衛生士の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // スタッフIDの重複チェック（自分以外）
      if (input.staffId) {
        const duplicateCheck = await pool.query(
          'SELECT id FROM hygienists WHERE staff_id = $1 AND id != $2',
          [input.staffId, id]
        );
        if (duplicateCheck.rows.length > 0) {
          throw new Error('このスタッフIDは既に使用されています');
        }
      }

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.staffId !== undefined) {
        updateFields.push(`staff_id = $${paramIndex++}`);
        values.push(input.staffId);
      }
      if (input.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }
      if (input.licenseNumber !== undefined) {
        updateFields.push(`license_number = $${paramIndex++}`);
        values.push(input.licenseNumber);
      }
      if (input.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        values.push(input.phone);
      }
      if (input.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(input.email);
      }

      if (updateFields.length === 0) {
        return existing; // 更新するフィールドがない場合は既存データを返す
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE hygienists SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return this.rowToHygienist(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('スタッフID')) {
        throw error;
      }
      throw new Error(`歯科衛生士の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士を削除
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // 歯科衛生士の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      // 関連する訪問記録があるかチェック
      const visitRecordsCheck = await pool.query(
        'SELECT COUNT(*) as count FROM visit_records WHERE hygienist_id = $1',
        [id]
      );
      
      if (parseInt(visitRecordsCheck.rows[0].count) > 0) {
        throw new Error('この歯科衛生士には訪問記録が存在するため削除できません');
      }

      // 関連するユーザーがあるかチェック
      const usersCheck = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE hygienist_id = $1',
        [id]
      );
      
      if (parseInt(usersCheck.rows[0].count) > 0) {
        throw new Error('この歯科衛生士にはユーザーアカウントが関連付けられているため削除できません');
      }

      const result = await pool.query(
        'DELETE FROM hygienists WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('訪問記録') || error.message.includes('ユーザー'))) {
        throw error;
      }
      throw new Error(`歯科衛生士の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士名で検索
   */
  static async searchByName(name: string): Promise<Hygienist[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM hygienists WHERE name ILIKE $1 ORDER BY name',
        [`%${name}%`]
      );
      return result.rows.map(this.rowToHygienist);
    } catch (error) {
      throw new Error(`歯科衛生士の検索に失敗しました: ${error}`);
    }
  }
}