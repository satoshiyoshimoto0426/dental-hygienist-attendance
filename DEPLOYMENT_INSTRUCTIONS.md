# 🚀 歯科衛生士月間勤怠システム - デプロイ手順書

## 📋 前提条件

以下のアカウントが必要です：
- GitHub アカウント（リポジトリ: https://github.com/satoshiyoshimoto0426/dental-hygienist-attendance）
- Vercel アカウント（フロントエンド用）
- Railway アカウント（バックエンド用）

## 1️⃣ バックエンドのデプロイ（Railway）

### Step 1: Railwayプロジェクトの作成

1. [Railway](https://railway.app/) にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. `dental-hygienist-attendance` リポジトリを選択

### Step 2: PostgreSQLの追加

1. プロジェクトダッシュボードで「New」→「Database」→「Add PostgreSQL」
2. PostgreSQLが自動的にプロビジョニングされます

### Step 3: 環境変数の設定

Railwayダッシュボードの「Variables」タブで以下を設定：

```env
NODE_ENV=production
PORT=3001
USE_MOCK_DB=false

# PostgreSQLの接続情報（Railwayが自動生成）
DATABASE_URL=${{RAILWAY_DATABASE_URL}}
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_NAME=${{PGDATABASE}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}

# JWT設定（必ず変更してください）
JWT_SECRET=your-very-strong-secret-key-change-this-immediately
JWT_EXPIRES_IN=7d

# CORS設定（フロントエンドのURLに変更）
CORS_ORIGIN=https://your-app-name.vercel.app

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: デプロイ設定

1. 「Settings」タブで以下を設定：
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. 「Deploy」をクリックしてデプロイ開始

### Step 5: データベースの初期化

Railway CLIまたはダッシュボードのQuery機能を使用：

```bash
# Railway CLIの場合
railway link
railway run --service=backend "cd backend && npx ts-node src/database/migrate.ts"
```

または、PostgreSQLサービスの「Query」タブから`backend/schema.sql`の内容を実行

### Step 6: 管理者パスワードの設定

初期管理者パスワードをハッシュ化して設定：

```javascript
// Node.jsで実行
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-admin-password', 10);
console.log(hash);
```

生成されたハッシュをデータベースに設定：

```sql
UPDATE users SET password_hash = '生成されたハッシュ' WHERE username = 'admin';
```

## 2️⃣ フロントエンドのデプロイ（Vercel）

### Step 1: Vercelプロジェクトの作成

1. [Vercel](https://vercel.com/) にログイン
2. 「New Project」をクリック
3. GitHubリポジトリ `dental-hygienist-attendance` をインポート

### Step 2: ビルド設定

以下の設定を行います：

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: 環境変数の設定

「Environment Variables」セクションで：

```env
VITE_API_URL=https://your-backend.up.railway.app
VITE_APP_TITLE=歯科衛生士月間勤怠システム
VITE_DEMO_MODE=false
```

※ `VITE_API_URL` はRailwayでデプロイしたバックエンドのURLに置き換えてください

### Step 4: デプロイ

「Deploy」ボタンをクリックしてデプロイ開始

## 3️⃣ デプロイ後の確認

### バックエンドの確認

1. Railway提供のURLにアクセス
2. ヘルスチェック: `https://your-backend.up.railway.app/health`
3. 以下のレスポンスが返ることを確認：
   ```json
   {
     "status": "OK",
     "timestamp": "2024-xx-xx...",
     "environment": "production"
   }
   ```

### フロントエンドの確認

1. Vercel提供のURLにアクセス
2. ログイン画面が表示されることを確認
3. 管理者アカウントでログイン：
   - ユーザー名: `admin`
   - パスワード: 設定したパスワード

## 4️⃣ カスタムドメインの設定（オプション）

### Vercel（フロントエンド）

1. プロジェクトの「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

### Railway（バックエンド）

1. サービスの「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

## ⚠️ 重要な注意事項

1. **JWT_SECRET**: 必ず強力なランダム文字列に変更してください
2. **管理者パスワード**: デプロイ後すぐに変更してください
3. **CORS設定**: フロントエンドの正確なURLを設定してください
4. **HTTPS**: 両方のサービスでHTTPSが有効になっていることを確認
5. **環境変数**: 本番環境の値は安全に管理してください

## 🔧 トラブルシューティング

### CORSエラーが発生する場合

- バックエンドの`CORS_ORIGIN`環境変数を確認
- フロントエンドのURLが正しく設定されているか確認

### データベース接続エラー

- Railway環境変数が正しく設定されているか確認
- PostgreSQLサービスが起動しているか確認

### ビルドエラー

- Node.jsバージョンが18以上であることを確認
- 依存関係が正しくインストールされているか確認

## 📞 サポート

問題が発生した場合は、GitHubのIssuesでお問い合わせください。

---

デプロイ完了後のURL例：
- フロントエンド: `https://dental-hygienist.vercel.app`
- バックエンドAPI: `https://dental-hygienist-api.up.railway.app`