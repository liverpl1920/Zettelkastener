# 要求内容: Git操作統合

## 作業日
2026-03-11

## ブランチ
feature/20260311-git-workflow

## 背景

現在のCopilot仕組み（スペック駆動開発）には、Gitのブランチ管理・コミット・PR作成が含まれておらず、これらは手動かつ定義されていない。  
開発フローの一貫性とトレーサビリティを高めるために、Git操作をCopilotの仕組みに組み込む。

## 要求

### 必須要件

1. **Gitワークフロースキルの追加**
   - ブランチ命名規則の定義（ステアリングディレクトリ名と対応）
   - Conventional Commitsの規約定義
   - コミットタイミングのルール定義（Phase単位）
   - GitHub CLI (`gh`) を使ったPR作成手順

2. **`add-feature.prompt.md` にGitステップを追加**
   - 作業開始前のGit準備（ブランチ作成）
   - Phase完了時の自動コミット
   - 作業完了後のgit pushとPR作成

3. **単発コミット用プロンプト**
   - `commit.prompt.md` を新規作成
   - `git diff --staged` を分析してConventional Commits形式でコミット

4. **`copilot-instructions.md` にGit戦略セクションを追加**
   - ブランチ戦略の明文化
   - コミット規約の明文化
   - 前提ツール（GitHub CLI）の明記

### 非機能要件

- 既存のプロンプト・スキルのパターンと一貫した形式を維持
- GitHub CLIが未インストールの場合でも最低限機能する（PR作成以外）

## スコープ外

- GitHub Actions / CI/CD の設定
- Git hooks の設定
- リモートリポジトリの初期設定
