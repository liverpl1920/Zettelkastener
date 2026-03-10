# 設計書

## アーキテクチャ概要

`src/renderer/` 配下において `.jsx` と `.tsx` の同名ファイルが共存しており、Vite のモジュール解決で `.jsx` が `.tsx` より優先されてしまう問題を、`.jsx` ファイルの削除で解消する。

## 問題の構造

```
Vite 拡張子解決順序（デフォルト）:
.mjs → .js → .ts → .jsx → .tsx → .json
                         ↑ここが問題
                 App.jsx が App.tsx より先にマッチ
```

```
index.html
  └── <script src="./index.tsx"> ← 明示的に .tsx を指定
        └── import App from './App'  ← 拡張子なし → App.jsx が選ばれる ← バグ
              │
              ├── App.jsx（古）: FleetingNoteList なし → 一覧が表示されない
              └── App.tsx（新）: FleetingNoteList あり → 本来読まれるべき
```

## 修正方針

削除するファイルは以下の 3 つ:

| ファイル | 理由 |
|---------|------|
| `src/renderer/App.jsx` | `App.tsx` の古いバージョン。削除で `App.tsx` が使われるようになる |
| `src/renderer/index.jsx` | `index.tsx` の古いバージョン。`index.html` は明示的に `index.tsx` を参照しているため現在は影響していないが、混乱の元なので削除 |
| `src/renderer/components/capture/QuickCaptureForm.jsx` | `QuickCaptureForm.tsx` の古いバージョン。現状も `.jsx` が優先されているため削除が必要 |

## テスト戦略

- `npm run typecheck`: TypeScript の型整合性確認
- `npm run lint`: コーディング規約準拠確認  
- `npm test`: ユニットテスト（統合テストは better-sqlite3 の NODE_MODULE_VERSION 問題で現状失敗するが別課題）
