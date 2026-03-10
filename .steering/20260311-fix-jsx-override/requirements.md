# 要求内容

## 概要

Fleeting Note を追加しても一覧画面に表示されないバグを修正する。原因は `.jsx` ファイルが `.tsx` ファイルより先に Vite に解決されることで、`FleetingNoteList` を含まない古い `App.jsx` が読み込まれていた。

## 背景

### 発生している問題

- クイックキャプチャでメモを保存しても、メインウィンドウの Fleeting Note 一覧に表示されない
- アプリを再起動しても表示されない
- DB を直接確認したところ 9件のノートが正しく保存されていた（DB 書き込みは正常）

### 根本原因

Vite のデフォルト拡張子解決順序:
`.mjs` → `.js` → `.ts` → `.jsx` → `.tsx` → `.json`

`index.tsx` が `import App from './App'` をすると `.jsx` > `.tsx` の順なので `App.jsx`（古いバージョン）が読み込まれる。

`App.jsx` には `FleetingNoteList` コンポーネントが存在せず、単純な見出しのみが表示されていた。

### 影響ファイル

| ファイル | 問題 |
|---------|------|
| `src/renderer/App.jsx` | 古い実装。`FleetingNoteList` なし。`.tsx` より優先される |
| `src/renderer/index.jsx` | 古い実装。`index.html` が明示的に `.tsx` を参照しているため現状は回避されているが要削除 |
| `src/renderer/components/capture/QuickCaptureForm.jsx` | 古い実装。現状 `.tsx` より優先される可能性あり |

## 実装対象の機能

### 1. 不要な .jsx ファイルの削除

`src/renderer/` 配下の `.jsx` ファイルはすべて `.tsx` に移行済みの古いコンパイル済みファイル。削除することで `.tsx` が正しく読み込まれるようにする。

## 受け入れ条件

- [ ] `src/renderer/App.jsx` が削除されている
- [ ] `src/renderer/index.jsx` が削除されている
- [ ] `src/renderer/components/capture/QuickCaptureForm.jsx` が削除されている
- [ ] `npm run typecheck` が通る
- [ ] `npm run lint` が通る
- [ ] `npm test` が通る（統合テストの better-sqlite3 バージョン問題は別課題）

## スコープ外

- 統合テストの `better-sqlite3` NODE_MODULE_VERSION 不整合の修正（別課題）
- Vite の resolve.extensions 設定変更（削除で解決可能なため不要）

## 参照ドキュメント

- `docs/architecture.md`
- `docs/development-guidelines.md`
