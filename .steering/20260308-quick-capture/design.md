# 設計書

## アーキテクチャ概要

Electron の Main/Renderer プロセス分離モデルに沿った実装。クイックキャプチャは専用のサブウィンドウとして実装する。

```
グローバルショートカット（Ctrl+Shift+N）
    ↓
Main Process: BrowserWindow を前面表示
    ↓  IPC: note:create
Renderer: QuickCaptureWindow（React）
    ↓
NoteService → NoteRepository → SQLite
```

## ディレクトリ構造（今回作成分）

```
src/
├── main/
│   ├── index.ts                    # Main Process エントリーポイント
│   ├── windows/
│   │   └── quickCapture.ts         # クイックキャプチャウィンドウ管理
│   ├── ipc/
│   │   └── NoteHandlers.ts         # note:create IPC ハンドラー
│   ├── services/
│   │   └── NoteService.ts          # ノートCRUDとバリデーション
│   ├── repositories/
│   │   └── NoteRepository.ts       # SQLite CRUD
│   ├── db/
│   │   ├── database.ts             # DB 接続・初期化
│   │   ├── schema.sql              # テーブル定義
│   │   └── migrations/
│   │       └── 001_initial.sql     # 初回マイグレーション
│   └── utils/
│       └── logger.ts               # ロガー
├── renderer/
│   ├── index.tsx                   # Renderer エントリーポイント
│   ├── App.tsx                     # ルートコンポーネント
│   ├── components/
│   │   └── capture/
│   │       └── QuickCaptureForm.tsx # クイックキャプチャフォーム
│   ├── hooks/
│   │   └── useDraftSave.ts         # localStorage ドラフト保存
│   └── stores/
│       └── useNoteStore.ts         # ノート状態管理（Zustand）
├── preload/
│   └── index.ts                    # contextBridge で window.api を公開
└── shared/
    └── types.ts                    # Note, NoteType, IPCResult 等の共通型
```

## コンポーネント設計

### Main Process

#### `main/index.ts`
- Electron BrowserWindow（ホーム画面）を起動
- グローバルショートカット登録（`Ctrl+Shift+N`）
- クイックキャプチャウィンドウのライフサイクル管理
- IPC ハンドラーの登録

#### `main/windows/quickCapture.ts`
- 400×200px のサブウィンドウを生成する `createQuickCaptureWindow()` 関数
- 既に開いている場合は再生成せず前面表示
- `alwaysOnTop: true`, `frame: false`

#### `main/ipc/NoteHandlers.ts`
- `note:create` チャネルを受け付け、`NoteService.create()` を呼ぶ

#### `main/services/NoteService.ts`
- `create(input: CreateNoteInput): Note` — Fleeting Note はバリデーション不要、即保存
- `validate(note: Partial<Note>, links: Link[]): ValidationResult` — 今フェーズでは最小実装（Fleeting は常に valid）

#### `main/repositories/NoteRepository.ts`
- `insert(note: Note): Note`
- `findById(id: string): Note | null`

#### `main/db/database.ts`
- `getDatabase(): Database` — シングルトンで better-sqlite3 接続を返す
- 起動時にスキーマとマイグレーションを適用

### Renderer Process

#### `renderer/components/capture/QuickCaptureForm.tsx`
- シンプルな `<textarea>` にオートフォーカス
- `Ctrl+Enter` → `window.api.notes.create()` → 成功後ウィンドウを閉じる
- `Esc` → 破棄してウィンドウを閉じる
- 保存失敗時にトーストで「保存に失敗しました」を表示

#### `preload/index.ts`
- `contextBridge.exposeInMainWorld('api', { notes: { create } })`

## データモデル（今フェーズ: Fleeting Note 最小実装）

```typescript
// shared/types.ts
type NoteType = 'fleeting' | 'literature' | 'permanent' | 'index';

interface Note {
  id: string;
  folgezettelId: string | null;
  type: NoteType;
  title: string;
  content: string;
  sourceTagIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string;
  processedAt: string | null;
}

interface CreateNoteInput {
  type: NoteType;
  content: string;
  title?: string;
}

interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

## SQLite スキーマ（今フェーズ）

```sql
-- 001_initial.sql
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  folgezettel_id TEXT UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('fleeting','literature','permanent','index')),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  processed_at TEXT
);
```

## エラーハンドリング方針

- `NoteService.create()` は `DatabaseError` を throw → IPC Handler が `{ success: false, error: { code: 'DATABASE_ERROR', message } }` を返す
- Renderer 側は `success === false` でトーストを表示
- 入力内容は `localStorage` に `draft_new` キーで保持（保存成功後に削除）

## テスト戦略

| 対象 | テスト種別 | フレームワーク |
|-----|---------|-------------|
| NoteService.create() | ユニット | Vitest |
| NoteRepository.insert() | 統合（インメモリSQLite） | Vitest |
| QuickCaptureForm | コンポーネント | Vitest + @testing-library/react |

## 設定ファイル一覧

| ファイル | 用途 |
|---------|------|
| `package.json` | 依存関係とスクリプト |
| `tsconfig.json` | TypeScript 設定（paths, strict） |
| `vite.config.ts` | Renderer バンドル設定 |
| `electron-builder.config.js` | パッケージング設定 |
| `.eslintrc.js` | ESLint ルール |
| `.prettierrc` | Prettier ルール |
| `.devcontainer/devcontainer.json` | devcontainer 設定 |
