import { pool } from './connection';
import fs from 'fs';
import path from 'path';

/**
 * データベースマイグレーションを実行
 */
export const runMigration = async (): Promise<void> => {
  try {
    console.log('データベースマイグレーションを開始します...');
    
    // スキーマファイルを読み込み
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // マイグレーション実行
    await pool.query(schema);
    
    console.log('データベースマイグレーションが完了しました');
  } catch (error) {
    console.error('マイグレーションエラー:', error);
    throw error;
  }
};

/**
 * テストデータを挿入
 */
export const seedTestData = async (): Promise<void> => {
  try {
    console.log('テストデータの挿入を開始します...');
    
    // 患者テストデータ
    await pool.query(`
      INSERT INTO patients (patient_id, name, phone, email, address) VALUES
      ('P001', '田中太郎', '090-1234-5678', 'tanaka@example.com', '東京都渋谷区1-1-1'),
      ('P002', '佐藤花子', '090-2345-6789', 'sato@example.com', '東京都新宿区2-2-2'),
      ('P003', '鈴木一郎', '090-3456-7890', 'suzuki@example.com', '東京都港区3-3-3')
      ON CONFLICT (patient_id) DO NOTHING;
    `);
    
    // 歯科衛生士テストデータ
    await pool.query(`
      INSERT INTO hygienists (staff_id, name, license_number, phone, email) VALUES
      ('H001', '山田美咲', 'DH-12345', '080-1111-2222', 'yamada@clinic.com'),
      ('H002', '高橋由美', 'DH-23456', '080-2222-3333', 'takahashi@clinic.com'),
      ('H003', '伊藤健太', 'DH-34567', '080-3333-4444', 'ito@clinic.com')
      ON CONFLICT (staff_id) DO NOTHING;
    `);
    
    // ユーザーテストデータ（パスワード: password123）
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (username, password_hash, role, hygienist_id) VALUES
      ('admin', $1, 'admin', NULL),
      ('yamada', $1, 'user', 1),
      ('takahashi', $1, 'user', 2)
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
    
    // 訪問記録テストデータ
    await pool.query(`
      INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status) VALUES
      (1, 1, '2024-01-15', '09:00', '10:00', 'completed'),
      (2, 1, '2024-01-15', '10:30', '11:30', 'completed'),
      (3, 2, '2024-01-16', '14:00', '15:00', 'completed'),
      (1, 2, '2024-01-17', '09:00', '10:00', 'scheduled'),
      (2, 3, '2024-01-18', '11:00', '12:00', 'cancelled')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('テストデータの挿入が完了しました');
  } catch (error) {
    console.error('テストデータ挿入エラー:', error);
    throw error;
  }
};

// スクリプトとして直接実行された場合
if (require.main === module) {
  (async () => {
    try {
      await runMigration();
      await seedTestData();
      process.exit(0);
    } catch (error) {
      console.error('マイグレーション失敗:', error);
      process.exit(1);
    }
  })();
}