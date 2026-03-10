# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ0: プロジェクト初期構築

- [x] `package.json` を作成する（Electron, React, SQLite, TypeScript 等の依存関係）
- [x] `tsconfig.json` を作成する
- [x] `vite.config.ts` / `electron.vite.config.ts` を作成する
- [x] `.eslintrc.js` を作成する
- [x] `.prettierrc` を作成する
- [x] `electron-builder.config.js` を作成する
- [x] `.devcontainer/devcontainer.json` を作成する
- [x] `src/shared/types.ts` を作成する（共通型定義）
- [x] `src/main/db/schema.sql` を作成する
- [x] `src/main/db/migrations/001_initial.sql` を作成する
- [x] `src/main/db/database.ts` を作成する（DB接続・初期化）
- [x] `src/main/utils/logger.ts` を作成する

## フェーズ1: サービス・リポジトリ層

- [x] `src/main/repositories/NoteRepository.ts` を作成する
- [x] `src/main/services/NoteService.ts` を作成する

## フェーズ2: IPC・Main Process

- [x] `src/preload/index.ts` を作成する（contextBridge）
- [x] `src/main/ipc/NoteHandlers.ts` を作成する
- [x] `src/main/windows/quickCapture.ts` を作成する
- [x] `src/main/index.ts` を作成する（エントリーポイント・ショートカット登録）

## フェーズ3: Renderer（React）

- [x] `src/renderer/index.tsx` を作成する
- [x] `src/renderer/App.tsx` を作成する
- [x] `src/renderer/stores/useNoteStore.ts` を作成する
- [x] `src/renderer/hooks/useDraftSave.ts` を作成する
- [x] `src/renderer/components/capture/QuickCaptureForm.tsx` を作成する

## フェーズ4: テスト

- [x] `tests/unit/main/services/NoteService.test.ts` を作成する
- [x] `tests/integration/note-crud.test.ts` を作成する

## フェーズ5: 依存関係インストールと動作確認

- [x] `npm install` を実行する（better-sqlite3 を v12.6.2 に更新して Node.js v24 対応）
- [x] `npm run typecheck` を実行してエラーがないことを確認する
- [x] `npm test` を実行してテストが通ることを確認する（14 tests passed）
- [x] `npm run lint` を実行してエラーがないことを確認する

---

## 実装後の振り返り

### 完了日時
2026-03-08

### 実装サマリー
Feature 1「即時メモ入力（クイックキャプチャ）」をゼロから実装完了。

### 対処した技術的課題

1. **better-sqlite3 の Node.js v24 非互換**
   - `better-sqlite3@9.x` が Node.js v24.11.1 でネイティブビルドに失敗
   - `better-sqlite3@12.6.2` に更新して解決

2. **@electron-toolkit/tsconfig 未インストール**
   - `tsconfig.node.json` と `tsconfig.web.json` が extends しているパッケージが欠けていた
   - `npm install -D @electron-toolkit/tsconfig` で解決

3. **ValidationError 名前衝突**
   - `src/shared/types.ts` の `ValidationError` インターフェースと `NoteService.ts` のローカルクラス `ValidationError` が衝突
   - ローカルクラスを `InputValidationError` にリネームして解決

4. **electron-vite typecheck コマンド非対応**
   - `electron-vite typecheck` がエントリーポイント未定義エラーを出力
   - `tsc --build`（プロジェクト参照）に切り替えて解決

5. **tsconfig.node.json の baseUrl 未設定**
   - `paths` を使うために `baseUrl: "."` が必要だった

6. **統合テストの相対パス誤り**
   - `tests/integration/` から `src/` への相対パスが `../../../` でなく `../../` が正しかった

### テスト結果
- Unit Tests: 8 tests passed (NoteService)
- Integration Tests: 6 tests passed (note CRUD)
- Typecheck: 0 errors
- ESLint: 0 violations

