-- Production Database Setup Script
-- This script should be run by a database administrator

-- Create production database
CREATE DATABASE dental_hygienist_prod;

-- Create dedicated user for the application
CREATE USER dental_hygienist_user WITH PASSWORD 'your_secure_database_password_here';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE dental_hygienist_prod TO dental_hygienist_user;
GRANT USAGE ON SCHEMA public TO dental_hygienist_user;
GRANT CREATE ON SCHEMA public TO dental_hygienist_user;

-- Connect to the production database
\c dental_hygienist_prod;

-- Grant table permissions (these will be applied to future tables as well)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dental_hygienist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO dental_hygienist_user;

-- Create tables (from existing schema)
-- Note: This will be executed by the application migration script

-- Security settings for production
-- Enable row level security (if needed in future)
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hygienists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visit_records_date ON visit_records(visit_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visit_records_patient ON visit_records(patient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visit_records_hygienist ON visit_records(hygienist_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visit_records_status ON visit_records(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hygienists_staff_id ON hygienists(staff_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);

-- Set up connection limits
ALTER USER dental_hygienist_user CONNECTION LIMIT 20;

-- Configure database settings for production
ALTER DATABASE dental_hygienist_prod SET log_statement = 'mod';
ALTER DATABASE dental_hygienist_prod SET log_min_duration_statement = 1000;
ALTER DATABASE dental_hygienist_prod SET shared_preload_libraries = 'pg_stat_statements';

-- Create backup user (read-only)
CREATE USER dental_hygienist_backup WITH PASSWORD 'your_secure_backup_password_here';
GRANT CONNECT ON DATABASE dental_hygienist_prod TO dental_hygienist_backup;
GRANT USAGE ON SCHEMA public TO dental_hygienist_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dental_hygienist_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO dental_hygienist_backup;