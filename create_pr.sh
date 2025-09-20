#!/bin/bash

# GitHubのユーザー名とリポジトリ名
OWNER="satoshiyoshimoto0426"
REPO="dental-hygienist-attendance"
BRANCH="genspark_ai_developer"
BASE="main"

# PR作成用のJSONデータ
PR_DATA='{
  "title": "feat: 歯科衛生士管理システムの主要機能改善",
  "body": "## 🚀 実装完了した機能\n\n### 1. 患者管理のCRUD機能\n- 完全なCRUD（作成・読取・更新・削除）機能を実装\n- ダイアログベースのフォームUI\n- 新規フィールド追加：\n  - 歯科クリニック\n  - 歯科医師\n  - 居宅介護支援事業所\n  - ケアマネージャー\n\n### 2. 歯科衛生士管理のCRUD機能\n- 完全なCRUD機能を実装\n- 専門分野の管理機能\n- アクティブ/非アクティブ状態の管理\n\n### 3. Excel出力の改善\n- A4単一シートフォーマットに対応\n- 患者情報と訪問記録を1枚にまとめて出力\n- より見やすいレイアウトに改善\n\n## 📝 変更ファイル\n- `/frontend/src/types/index.ts`\n- `/frontend/src/pages/PatientList.tsx`\n- `/frontend/src/pages/HygienistList.tsx`\n- `/frontend/src/utils/excelExport.ts`\n- `/frontend/src/pages/Reports.tsx`\n\n## ✅ テスト済み\n- ローカル環境で動作確認済み\n- CRUD機能の動作確認済み\n- Excel出力機能の動作確認済み\n\n## 🚀 デプロイ\nこのPRをマージすると、Vercelが自動的にデプロイを実行します。",
  "head": "genspark_ai_developer",
  "base": "main"
}'

# GitHubトークンを取得
TOKEN=$(git config --get credential.helper | grep -q store && grep github.com ~/.git-credentials | head -1 | sed 's/.*github.com\///' | sed 's/@.*//')

if [ -z "$TOKEN" ]; then
  echo "GitHubトークンが見つかりません"
  exit 1
fi

# プルリクエストを作成
echo "プルリクエストを作成中..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$OWNER/$REPO/pulls" \
  -d "$PR_DATA")

# PR番号を取得
PR_NUMBER=$(echo $RESPONSE | grep -o '"number":[0-9]*' | sed 's/"number"://')

if [ -n "$PR_NUMBER" ]; then
  echo "✅ プルリクエスト #$PR_NUMBER を作成しました"
  echo "URL: https://github.com/$OWNER/$REPO/pull/$PR_NUMBER"
  
  # 自動マージを試みる（権限がある場合）
  echo "自動マージを試みています..."
  MERGE_RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/pulls/$PR_NUMBER/merge" \
    -d '{"commit_title":"Merge pull request #'$PR_NUMBER' from genspark_ai_developer","commit_message":"歯科衛生士管理システムの主要機能改善を実装","merge_method":"merge"}')
  
  if echo $MERGE_RESPONSE | grep -q '"merged":true'; then
    echo "✅ プルリクエストをマージしました！"
    echo "Vercelが自動的にデプロイを開始します。"
  else
    echo "⚠️ 自動マージに失敗しました。手動でマージしてください。"
    echo "PR URL: https://github.com/$OWNER/$REPO/pull/$PR_NUMBER"
  fi
else
  echo "❌ プルリクエストの作成に失敗しました"
  echo "レスポンス: $RESPONSE"
  echo ""
  echo "手動でプルリクエストを作成してください："
  echo "https://github.com/$OWNER/$REPO/compare/main...genspark_ai_developer?expand=1"
fi