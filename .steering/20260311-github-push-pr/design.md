# 設計

## 実装アプローチ

### 方針
1. GitHubリモートをSSHではなくHTTPS形式で設定（`gh` CLI認証済みのため）
2. masterブランチをそのままorigin/masterとしてプッシュ
3. feature/improve-readme ブランチでREADME.mdのプレースホルダー修正を行い、PRを作成
4. PR作成には`gh pr create` コマンドを使用

### ブランチ戦略

```
master (既存の9コミット) ← 本流
  └── feature/improve-readme
        └── README.md の clone URL 修正（yourname → liverpl1920）
```

### PR作成の詳細

- **ベースブランチ**: master
- **フィーチャーブランチ**: feature/improve-readme
- **変更内容**: README.md内のプレースホルダー(`yourname`)を実際のGitHubユーザー名(`liverpl1920`)に修正
- **PR タイトル**: `docs: fix README clone URL to actual GitHub repository`
- **PRラベル**: documentation

### 使用コマンド

```bash
# リモート設定
git remote add origin https://github.com/liverpl1920/Zettelkastener.git

# masterプッシュ
git push -u origin master

# featureブランチ作成・切替
git checkout -b feature/improve-readme

# 変更コミット
git add README.md
git commit -m "docs: fix README clone URL to actual GitHub repository"

# featureブランチプッシュ
git push -u origin feature/improve-readme

# PR作成
gh pr create \
  --base master \
  --head feature/improve-readme \
  --title "docs: fix README clone URL to actual GitHub repository" \
  --body "..."
```

## リスクと対処法

| リスク | 対処法 |
|--------|--------|
| SSH認証エラー | HTTPS URLを使用 (gh authはHTTPS/SSHとも対応) |
| masterブランチへの直接プッシュ拒否 | リポジトリがprivateで保護設定がない前提 |
| git pushのリモート拒否 | gh auth tokenを使ったHTTPS認証を確認 |
