# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: Git 初期化

- [x] `.gitignore` を作成する
- [x] `git init` でリポジトリを初期化する（下記コマンドをユーザーが手動実行）
- [x] 初回コミットを作成する（下記コマンドをユーザーが手動実行）

> **手動実行が必要なコマンド:**
> ```bash
> git init -b main
> git config user.name "Your Name"
> git config user.email "your@email.com"
> chmod +x .husky/pre-commit
> git add -A
> git commit -m "chore: initial commit - Git/CI setup"
> ```

## フェーズ2: pre-commit フック (husky + lint-staged)

- [x] `lint-staged` をインストールする（package.json に既存。`npm install` 済み）
- [x] `.lintstagedrc` を作成する（package.json 内の `lint-staged` セクションに設定済み）
- [x] `husky` を初期化して `.husky/pre-commit` を設定する

## フェーズ3: CI ワークフロー改善

- [x] `.github/workflows/test.yml` を改善した内容に置き換える
  - [x] npm キャッシュ設定を追加する
  - [x] `npm ci` を使用する
  - [x] typecheck → lint → test:ci の順で実行する
- [x] `test:ci` スクリプトを `package.json` に追加する（better-sqlite3 rebuild 込み）

## フェーズ4: 品質チェック

- [x] 型エラーがないことを確認する
  - [x] `npm run typecheck` → エラーなし
- [x] リントエラーがないことを確認する
  - [x] `npm run lint` → エラーなし
- [x] テストが通ることを確認する
  - [x] `npm run test:ci` → 17/17 通過

---

## 実装後の振り返り

**実装完了日**: 2026-03-11

### 計画と実績の差分

- `git init` と初回コミットはターミナル操作のためユーザーによる手動実行が必要（コマンドは上記に記載）
- `lint-staged` は `package.json` に既に設定済みで追加インストール不要だった
- CI ワークフローに `test:ci` スクリプト（`posttest` の Electron リビルドを省略）を追加することで CI 環境での動作を保証

### 作成・変更したファイル

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `.gitignore` | 新規作成 | node_modules, out/, dist/, *.db 等を除外 |
| `.husky/pre-commit` | 新規作成 | コミット時に `npx lint-staged` を実行 |
| `.github/workflows/test.yml` | 更新 | npm キャッシュ、`npm ci`、`test:ci` スクリプト使用に改善 |
| `package.json` | 更新 | `test:ci` スクリプト追加 |

### 学んだこと

- `npm test` の `pretest`/`posttest` ライフサイクルフックで Node.js/Electron 向けリビルドを切り替える仕組みは CI で `posttest` が不要（CI は Node.js 環境のみ）なため、`test:ci` スクリプトを別途定義するのが適切
- `husky` v9 は `.husky/pre-commit` ファイルにスクリプトを書くだけで動作する（`git init` 後に `npm install` を実行すると `prepare` スクリプト経由で自動設定される）

### 次回への改善提案

- `npm run rebuild:electron` を `npm test` 後に忘れずに実行する（`npm test` の `posttest` が行うが、`test:ci` を使った後は手動実行が必要）
- GitHub リモートリポジトリとの接続は別途行うこと（`git remote add origin <URL>`）
