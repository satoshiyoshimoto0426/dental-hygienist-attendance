# 設計書

## 概要

歯科衛生士月間勤怠システムは、Webベースのアプリケーションとして設計されます。フロントエンドにReact、バックエンドにNode.js/Express、データベースにPostgreSQLを使用したモダンなWebアプリケーション構成を採用します。

## アーキテクチャ

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │   Express       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

- **フロントエンド**: React 18, TypeScript, Material-UI, React Router
- **バックエンド**: Node.js, Express, TypeScript, JWT認証
- **データベース**: PostgreSQL
- **その他**: 
  - カレンダーUI: React Big Calendar
  - CSV出力: Papa Parse
  - 日付処理: date-fns
  - 状態管理: React Context API

## コンポーネントとインターフェース

### フロントエンドコンポーネント構成

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── masters/
│   │   ├── PatientMaster.tsx
│   │   ├── PatientForm.tsx
│   │   ├── HygienistMaster.tsx
│   │   └── HygienistForm.tsx
│   ├── attendance/
│   │   ├── AttendanceCalendar.tsx
│   │   ├── VisitRecordForm.tsx
│   │   └── MonthlyView.tsx
│   └── reports/
│       ├── PatientReport.tsx
│       ├── HygienistReport.tsx
│       └── ExportButton.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── PatientManagement.tsx
│   ├── HygienistManagement.tsx
│   ├── AttendanceManagement.tsx
│   └── Reports.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── export.ts
└── types/
    ├── Patient.ts
    ├── Hygienist.ts
    └── VisitRecord.ts
```

### バックエンドAPI構成

```
src/
├── controllers/
│   ├── authController.ts
│   ├── patientController.ts
│   ├── hygienistController.ts
│   ├── visitRecordController.ts
│   └── reportController.ts
├── models/
│   ├── Patient.ts
│   ├── Hygienist.ts
│   └── VisitRecord.ts
├── routes/
│   ├── auth.ts
│   ├── patients.ts
│   ├── hygienists.ts
│   ├── visitRecords.ts
│   └── reports.ts
├── middleware/
│   ├── auth.ts
│   └── validation.ts
├── services/
│   ├── database.ts
│   ├── reportService.ts
│   └── csvExportService.ts
└── utils/
    ├── dateUtils.ts
    └── validation.ts
```

### APIエンドポイント設計

#### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/verify` - トークン検証

#### 患者マスタ
- `GET /api/patients` - 患者一覧取得
- `POST /api/patients` - 患者登録
- `PUT /api/patients/:id` - 患者更新
- `DELETE /api/patients/:id` - 患者削除

#### 歯科衛生士マスタ
- `GET /api/hygienists` - 歯科衛生士一覧取得
- `POST /api/hygienists` - 歯科衛生士登録
- `PUT /api/hygienists/:id` - 歯科衛生士更新
- `DELETE /api/hygienists/:id` - 歯科衛生士削除

#### 訪問記録
- `GET /api/visit-records` - 訪問記録一覧取得（月指定）
- `POST /api/visit-records` - 訪問記録登録
- `PUT /api/visit-records/:id` - 訪問記録更新
- `DELETE /api/visit-records/:id` - 訪問記録削除

#### レポート
- `GET /api/reports/patient/:patientId/monthly` - 患者別月間統計
- `GET /api/reports/hygienist/:hygienistId/monthly` - 歯科衛生士別月間統計
- `GET /api/reports/export/csv` - CSV出力

## データモデル

### データベーススキーマ

#### patients テーブル
```sql
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
```

#### hygienists テーブル
```sql
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
```

#### visit_records テーブル
```sql
CREATE TABLE visit_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    hygienist_id INTEGER REFERENCES hygienists(id),
    visit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) DEFAULT 'completed', -- 'scheduled', 'completed', 'cancelled'
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### users テーブル（認証用）
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    hygienist_id INTEGER REFERENCES hygienists(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript型定義

#### Patient型
```typescript
interface Patient {
    id: number;
    patientId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

#### Hygienist型
```typescript
interface Hygienist {
    id: number;
    staffId: string;
    name: string;
    licenseNumber?: string;
    phone?: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

#### VisitRecord型
```typescript
interface VisitRecord {
    id: number;
    patientId: number;
    hygienistId: number;
    visitDate: Date;
    startTime?: string;
    endTime?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    cancellationReason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    // 関連データ
    patient?: Patient;
    hygienist?: Hygienist;
}
```

## エラーハンドリング

### フロントエンドエラーハンドリング
- APIエラーの統一的な処理
- ユーザーフレンドリーなエラーメッセージ表示
- ネットワークエラー時の再試行機能
- バリデーションエラーの表示

### バックエンドエラーハンドリング
- 統一されたエラーレスポンス形式
- データベースエラーの適切な処理
- 認証エラーの処理
- バリデーションエラーの詳細な情報提供

### エラーレスポンス形式
```typescript
interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}
```

## テスト戦略

### フロントエンドテスト
- **単体テスト**: Jest + React Testing Library
  - コンポーネントの動作テスト
  - カスタムフックのテスト
  - ユーティリティ関数のテスト
- **統合テスト**: 
  - APIとの連携テスト
  - ページ間の遷移テスト
- **E2Eテスト**: Cypress
  - ユーザーシナリオの自動テスト

### バックエンドテスト
- **単体テスト**: Jest
  - コントローラーのテスト
  - サービス層のテスト
  - ユーティリティ関数のテスト
- **統合テスト**:
  - APIエンドポイントのテスト
  - データベース操作のテスト
- **負荷テスト**: 
  - 月末の大量データ処理時の性能テスト

### テストデータ
- 患者マスタのサンプルデータ
- 歯科衛生士マスタのサンプルデータ
- 月間訪問記録のサンプルデータ
- 各種エッジケースのテストデータ