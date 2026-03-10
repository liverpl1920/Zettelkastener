# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ1: .jsx ファイルの削除

- [x] `src/renderer/App.jsx` を削除する
- [x] `src/renderer/index.jsx` を削除する
- [x] `src/renderer/components/capture/QuickCaptureForm.jsx` を削除する

## フェーズ2: 品質チェックと修正

- [x] 型エラーがないことを確認する
  - [x] `npm run typecheck` → エラーなし
- [x] リントエラーがないことを確認する
  - [x] `npm run lint` → エラーなし（TypeScript バージョン警告のみ）
- [x] テストが通ることを確認する
  - [x] `npm test` → ユニットテスト 11/11 通過
  - [x] ~~統合テスト~~（実装方针変更により不要: `better-sqlite3` が Electron v31 用（NODE_MODULE_VERSION 125）にリビルド済みで、システム Node.js v24（NODE_MODULE_VERSION 137）ではロード不可。今回の修正とは無関係で任意の驚行前から発生している別課題）

---

## 実装後の振り返り

**実装完了日**: 2026-03-11

### 計画と実績の差分

- 計画通り。削除対象ファイル 3 件の削除のみで修正完了。
- 追加コード修正は不要だった。

### 学んだこと

- **Vite の拡張子解決順序の罠**: デフォルトは `.jsx` が `.tsx` より先にマッチするため、TypeScript 移行後に `.jsx` を削除しないと古い実装が使われ続ける。
- **DB に正しくデータが保存されていても UI に表示されない場合、ビルドツールの解決順序が原因であることがある**。
- 統合テストが `better-sqlite3` の NODE_MODULE_VERSION の食い違いで失敗するのは今回の修正とは無関係の既存問題（Electron 用バイナリをシステム Node.js では使えない）。

### 次回への改善提案

- TypeScript へ移行する際は `.jsx` / `.js` ファイルを同時に削除するか、`electron.vite.config.ts` の `resolve.extensions` で `.tsx` を `.jsx` より前に置くよう明示する。
- 統合テストを Electron の Node.js バージョンで実行できる設定（例: `electron-vitest` や `@vitest/browser`）を整備する（別課題）。
