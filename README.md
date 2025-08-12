# 歯科衛生士月間勤怠システム

歯科衛生士の患者訪問記録を効率的に管理し、月間の訪問実績を追跡するためのWebアプリケーションです。

## 🌟 主な機能

- **患者マスタ管理**: 患者情報の登録・編集・削除
- **歯科衛生士マスタ管理**: 歯科衛生士情報の管理
- **訪問記録管理**: カレンダー形式での訪問記録入力
- **レポート機能**: 患者別・歯科衛生士別の統計レポート
- **CSV出力**: データのエクスポート機能
- **認証システム**: セキュアなログイン機能

## 🛠️ 技術スタック

### フロントエンド
- React 18
- TypeScript
- Material-UI
- React Router
- React Big Calendar
- Vite

### バックエンド
- Node.js
- Express
- TypeScript
- JWT認証
- bcrypt

### データベース
- PostgreSQL（本番環境）
- インメモリDB（開発環境）

## 🚀 デプロイ

### 本番環境
- **フロントエンド**: Vercel
- **バックエンド**: Railway

### 開発環境
```bash
# バックエンド起動
cd backend
npm install
npm run dev

# フロントエンド起動
cd frontend
npm install
npm run dev
```

## 📱 アクセス

- **本番環境**: https://dental-hygienist-attendance.vercel.app
- **開発環境**: http://localhost:3000

## 🔐 テスト用ログイン情報

- **ユーザー名**: admin
- **パスワード**: admin

## 📋 システム要件

- Node.js 18以上
- npm または yarn
- モダンブラウザ（Chrome, Firefox, Safari, Edge）

## 🏗️ プロジェクト構造

```
dental-hygienist-attendance/
├── frontend/          # Reactフロントエンド
├── backend/           # Node.js/Expressバックエンド
├── scripts/           # デプロイメントスクリプト
└── docs/             # ドキュメント
```

## 🤝 貢献

プロジェクトへの貢献を歓迎します。Issue報告やPull Requestをお待ちしています。

## 📄 ライセンス

MIT License

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesでお知らせください。