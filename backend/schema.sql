-- 歯科衛生士月間勤怠システム データベーススキーマ

-- 既存のテーブルを削除（開発環境用）
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS daily_visit_records CASCADE;
DROP TABLE IF EXISTS visit_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS hygienists CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- 患者テーブル
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 歯科衛生士テーブル
CREATE TABLE hygienists (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーテーブル（認証用）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    hygienist_id INTEGER REFERENCES hygienists(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 訪問記録テーブル
CREATE TABLE visit_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hygienist_id INTEGER NOT NULL REFERENCES hygienists(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, hygienist_id, visit_date, start_time)
);

-- 日次訪問記録テーブル
CREATE TABLE daily_visit_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hygienist_id INTEGER NOT NULL REFERENCES hygienists(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    treatment_details TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, hygienist_id, visit_date, start_time)
);

-- 月次報告テーブル
CREATE TABLE monthly_reports (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hygienist_id INTEGER NOT NULL REFERENCES hygienists(id) ON DELETE CASCADE,
    report_year INTEGER NOT NULL,
    report_month INTEGER NOT NULL CHECK (report_month >= 1 AND report_month <= 12),
    total_visits INTEGER DEFAULT 0,
    total_hours DECIMAL(5,2) DEFAULT 0,
    completed_visits INTEGER DEFAULT 0,
    cancelled_visits INTEGER DEFAULT 0,
    summary TEXT,
    care_manager_notes TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, hygienist_id, report_year, report_month)
);

-- インデックスの作成
CREATE INDEX idx_visit_records_date ON visit_records(visit_date);
CREATE INDEX idx_visit_records_patient ON visit_records(patient_id);
CREATE INDEX idx_visit_records_hygienist ON visit_records(hygienist_id);
CREATE INDEX idx_daily_visit_records_date ON daily_visit_records(visit_date);
CREATE INDEX idx_daily_visit_records_patient ON daily_visit_records(patient_id);
CREATE INDEX idx_daily_visit_records_hygienist ON daily_visit_records(hygienist_id);
CREATE INDEX idx_monthly_reports_year_month ON monthly_reports(report_year, report_month);

-- 初期データの挿入
-- 管理者ユーザー（パスワード: admin）
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$YourHashedPasswordHere', 'admin');

-- サンプル患者データ
INSERT INTO patients (patient_id, name, phone, email, address) VALUES 
('P001', '田中太郎', '090-1234-5678', 'tanaka@example.com', '東京都新宿区1-2-3'),
('P002', '佐藤花子', '090-2345-6789', 'sato@example.com', '東京都渋谷区4-5-6'),
('P003', '鈴木一郎', '090-3456-7890', 'suzuki@example.com', '東京都港区7-8-9');

-- サンプル歯科衛生士データ
INSERT INTO hygienists (staff_id, name, license_number, phone, email) VALUES 
('H001', '山田美咲', 'DH12345', '090-4567-8901', 'yamada@example.com'),
('H002', '高橋健太', 'DH23456', '090-5678-9012', 'takahashi@example.com');