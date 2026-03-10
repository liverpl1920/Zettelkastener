# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: Main Process 拡張

- [x] `NoteService` に `getByType(type: NoteType): Note[]` を追加する
- [x] `NoteRepository.findByType` の ORDER BY を createdAt DESC に修正する（実装済みだったためスキップ不要）
- [x] `NoteHandlers` に `note:getByType` IPC ハンドラーを追加する

## フェーズ2: Preload / 型定義 拡張

- [x] `src/preload/index.ts` に `getByType` を追加する
- [x] `src/shared/window.d.ts` の型定義を更新する

## フェーズ3: Renderer 実装

- [x] `src/renderer/components/notes/FleetingNoteList.tsx` を作成する
- [x] `src/renderer/App.tsx` を更新してメイン画面に FleetingNoteList を組み込む

## フェーズ4: テスト追加

- [x] `tests/unit/main/services/NoteService.test.ts` に `getByType` のテストを追加する

## フェーズ5: 品質チェック

- [x] `npm test` が通ることを確認する（17 tests passed）
- [x] `npm run lint` が通ることを確認する（0 errors, 0 warnings）
- [x] `npm run typecheck` が通ることを確認する（0 errors）

---

## 実装後の振り返り

### 完了日時
2026-03-11

### 計画と実績の差分

- `NoteRepository.findByType()` は最初から `ORDER BY created_at DESC` が実装済みだった → タスクは「確認のみ」で完了
- `useNoteStore` に `upsertNotes`（一括更新）の追加が必要だと実装中に判明 → tasklist の外作業として対応

### 技術的な学び

- `better-sqlite3` は Electron と Node.js（Vitest）で別々のビルドが必要（NODE_MODULE_VERSION が異なる）
  - Electron 31: NODE_MODULE_VERSION 125
  - Node.js v24: NODE_MODULE_VERSION 137
  - 対策: `npm run rebuild:node`（テスト前）/ `npm run rebuild:electron`（dev前）スクリプトを追加

### 次回への改善提案

- `npm test` の前に自動で `rebuild:node` を実行する `pretest` スクリプトを追加すると便利
- Fleeting Note の削除・変換UIを実装（Feature 2=機能2）
