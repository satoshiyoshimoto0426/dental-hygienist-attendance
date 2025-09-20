# 🎯 Vercelへの自動デプロイ設定（コピペで完了）

## 1️⃣ Vercelにログイン
https://vercel.com

## 2️⃣ 新しいプロジェクトを作成
「Add New...」→「Project」をクリック

## 3️⃣ GitHubリポジトリをインポート
`dental-hygienist-attendance` を選択

## 4️⃣ 以下の設定をそのままコピペ

### Project Name（プロジェクト名）
```
dental-hygienist-system
```

### Framework Preset（フレームワーク）
```
Other
```

### Root Directory（ルートディレクトリ）
```
frontend
```

### Build Command（ビルドコマンド）- これをコピペ
```
npm install --legacy-peer-deps && npm run build
```

### Output Directory（出力ディレクトリ）
```
dist
```

### Install Command（インストールコマンド）
```
npm install --legacy-peer-deps
```

## 5️⃣ 環境変数を追加

Environment Variablesセクションで「Add」をクリック：

| Name | Value |
|------|-------|
| VITE_DEMO_MODE | true |
| NODE_VERSION | 18 |

## 6️⃣ Deployボタンをクリック

以上です！

---

## もしエラーが出たら

### メモリエラーの場合
Build Commandを以下に変更：
```
NODE_OPTIONS=--max-old-space-size=4096 npm install --legacy-peer-deps && npm run build
```

### package.jsonエラーの場合
Root Directoryを以下に変更：
```
./frontend
```

---

## デプロイ成功後

URLが表示されます（例：https://dental-hygienist-system.vercel.app）

ログイン情報：
- ユーザー名: admin
- パスワード: admin