-- 歯科衛生士月間勤怠システム データベーススキーマ

-- 患者テーブル
CREATE TABLE IF NOT EXISTS patients (
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
CREATE TABLE IF NOT EXISTS hygienists (
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
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    hygienist_id INTEGER REFERENCES hygienists(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日次訪問記録テーブル
CREATE TABLE IF NOT EXISTS daily_visit_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hygienist_id INTEGER NOT NULL REFERENCES hygienists(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 月次報告記録テーブル（ケアマネ向け総括レポート）
CREATE TABLE IF NOT EXISTS monthly_reports (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hygienist_id INTEGER NOT NULL REFERENCES hygienists(id) ON DELETE CASCADE,
    report_year INTEGER NOT NULL,
    report_month INTEGER NOT NULL CHECK (report_month >= 1 AND report_month <= 12),
    total_visits INTEGER DEFAULT 0,
    total_hours DECIMAL(5,2) DEFAULT 0,
    completed_visits INTEGER DEFAULT 0,
    cancelled_visits INTEGER DEFAULT 0,
    summary TEXT, -- 月間総括
    care_manager_notes TEXT, -- ケアマネ向けコメント
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, hygienist_id, report_year, report_month)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_hygienists_staff_id ON hygienists(staff_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_daily_visit_records_date ON daily_visit_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_daily_visit_records_patient ON daily_visit_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_visit_records_hygienist ON daily_visit_records(hygienist_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_year_month ON monthly_reports(report_year, report_month);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_patient ON monthly_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_hygienist ON monthly_reports(hygienist_id);

-- updated_atカラムを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにupdated_atトリガーを設定
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hygienists_updated_at BEFORE UPDATE ON hygienists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_visit_records_updated_at BEFORE UPDATE ON daily_visit_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_reports_updated_at BEFORE UPDATE ON monthly_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();