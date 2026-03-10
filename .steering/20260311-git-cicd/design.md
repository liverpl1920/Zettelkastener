# 設計書

## アーキテクチャ概要

Git + GitHub Actions によるローカル開発品質ゲートと CI パイプラインを整備する。

```
開発フロー:
  コード変更
    → git add
    → git commit
      ↓ pre-commit hook (husky + lint-staged)
        ESLint --fix + Prettier --write (staged files 対象)
      ↓ 成功
    → push to GitHub
      ↓ GitHub Actions: CI workflow
        typecheck → lint → test (pretest で sqlite rebuild 込み)
```

## コンポーネント設計

### 1. .gitignore

**責務**: ビルド成果物・依存関係・機密情報・OS ファイルを追跡対象外にする

**除外対象**:
- `node_modules/` — 依存関係
- `out/` — electron-vite ビルド出力
- `dist/` — electron-builder 成果物
- `*.db`, `*.db-wal`, `*.db-shm` — SQLite データファイル
- `.env*` — 環境変数ファイル
- OS/エディタ系ファイル（`.DS_Store`, `Thumbs.db` 等）
- ログファイル (`logs/`, `*.log`)
- coverage, `.tsbuildinfo`

### 2. husky + lint-staged

**責務**: コミット前にステージングファイルのみに自動フォーマット・lint を適用

**設定**:
- `.lintstagedrc`: `*.{ts,tsx}` に `eslint --fix` → `prettier --write`
- `.husky/pre-commit`: `npx lint-staged` を実行

**実装の要点**:
- `husky init` で `.husky/` を生成し、`pre-commit` を上書き
- `lint-staged` は devDependencies に追加が必要（現状未インストール）

### 3. CI ワークフロー (.github/workflows/ci.yml)

**責務**: プッシュ・PR 時に品質チェックを自動実行

**ジョブ構成**:
```yaml
jobs:
  quality:
    - checkout
    - setup Node.js 24.x (npm キャッシュ付き)
    - npm ci
    - typecheck
    - lint
    - test (pretest が better-sqlite3 rebuild 込み)
```

**実装の要点**:
- `npm ci` で厳密なロックファイルインストール
- `npm cache` で依存関係キャッシュ（キャッシュキー: `package-lock.json` のハッシュ）
- `better-sqlite3` のリビルドは `pretest` スクリプトに任せる（既存実装）
- 既存の `test.yml` は名前を `ci.yml` に変更・内容を置き換え

## テスト戦略

- この機能は設定ファイル群なのでテストは `npm test` が通ることで代替
