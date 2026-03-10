# 要求内容

## 概要

コードベースを Git で管理し、CI/CD パイプラインを整備する。

## 背景

- 現在 Git リポジトリが初期化されていない
- `.github/workflows/test.yml` は存在するが Git 管理外
- `package.json` に `husky` の `prepare` スクリプトが登録されているが、`.husky/` ディレクトリと `lint-staged` 設定が存在しない
- `development-guidelines.md` に husky + lint-staged によるコミット時自動チェックが要件として明記されている
- `npm test` が `pretest`/`posttest` で better-sqlite3 のリビルドを行うため CI でも同様の対処が必要

## 実装対象の機能

### 1. Git リポジトリの初期化

- `git init` でリポジトリを初期化
- `.gitignore` を作成（node_modules, out/, dist/, *.db, .env など）
- 初回コミット

### 2. pre-commit フック (husky + lint-staged)

- `.husky/pre-commit` スクリプトを作成
- `.lintstagedrc` でコミット対象ファイルに ESLint + Prettier を適用
- コミット時に型エラーがあればブロック

### 3. CI/CD ワークフロー改善

既存の `.github/workflows/test.yml` を改善:
- Node.js 24.x セットアップ
- npm キャッシュ設定
- better-sqlite3 のリビルドを `npm test` の `pretest` に任せる（既存の仕組み）
- typecheck, lint, test を並列・順次実行

## 受け入れ条件

- [ ] `git status` が正常に動作する
- [ ] `.gitignore` が `node_modules/`, `out/`, `dist/` を無視する
- [ ] `git commit` 時に ESLint と Prettier が自動実行される
- [ ] CI で `npm run typecheck`, `npm run lint`, `npm test` がすべて通る
- [ ] `npm test` が 17/17 通過する

## スコープ外

- GitHub リポジトリへのリモート push 設定（ローカル環境のみ）
- CD（デプロイ）パイプライン

## 参照ドキュメント

- `docs/development-guidelines.md`
- `docs/architecture.md`
