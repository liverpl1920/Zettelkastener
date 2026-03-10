# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
Zettelkastener/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── ipc/                 # IPC Handlers（Rendererからの要求受付）
│   │   ├── services/            # Serviceレイヤー（ビジネスロジック）
│   │   ├── repositories/        # Repositoryレイヤー（SQLite操作）
│   │   ├── db/                  # DBスキーマ・マイグレーション
│   │   ├── utils/               # ユーティリティ（logger等）
│   │   └── index.ts             # Main Processエントリーポイント
│   ├── renderer/                # Electron Renderer Process (React)
│   │   ├── components/          # UIコンポーネント
│   │   ├── pages/               # ページ単位のコンポーネント
│   │   ├── stores/              # 状態管理（Zustand）
│   │   ├── hooks/               # カスタムフック
│   │   └── index.tsx            # Renderer エントリーポイント
│   ├── preload/
│   │   └── index.ts             # IPC橋渡し（contextBridge）
│   └── shared/                  # Main/Renderer共通の型定義
│       └── types.ts
├── tests/
│   ├── unit/                    # ユニットテスト
│   │   ├── main/
│   │   │   ├── services/
│   │   │   └── repositories/
│   │   └── renderer/
│   │       └── components/
│   ├── integration/             # 統合テスト（Service + DB）
│   └── e2e/                     # E2Eテスト（Playwright）
├── docs/                        # プロジェクトドキュメント
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md  # 本ドキュメント
│   ├── development-guidelines.md
│   ├── glossary.md
│   └── idea/                    # アイデア・ブレスト（非正式）
│       └── initial-requirements.md
├── .github/
│   ├── copilot-instructions.md
│   ├── prompts/
│   ├── skills/
│   ├── agents/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── test.yml            # typecheck / lint / test
│       └── release.yml         # build / package / release
├── .steering/                   # 作業単位のドキュメント（requirements.md / design.md / tasklist.md）
│   └── [YYYYMMDD]-[機能名]/    # 例: 20260308-add-user-profile/
├── .devcontainer/
│   └── devcontainer.json        # VS Code devcontainer設定
├── electron-builder.config.js   # Electronパッケージング設定
├── vite.config.ts               # Viteバンドラー設定
├── tsconfig.json                # TypeScript設定
├── package.json
├── .eslintrc.js
└── .prettierrc
```

---

## ディレクトリ詳細

### src/main/ （Main Process）

#### src/main/ipc/

**役割**: Renderer Process からの IPC リクエストを受け取り、Serviceレイヤーに委譲する

**配置ファイル**:
- `[エンティティ名]Handlers.ts`: 各エンティティのIPCハンドラーをまとめたファイル

**命名規則**:
- パターン: `[EntityName]Handlers.ts`（PascalCase）
- 例: `NoteHandlers.ts`, `LinkHandlers.ts`

**依存関係**:
- 依存可能: `services/`
- 依存禁止: `repositories/`（Serviceを経由すること）

**例**:
```
ipc/
├── NoteHandlers.ts
├── LinkHandlers.ts
└── SearchHandlers.ts
```

---

#### src/main/services/

**役割**: ビジネスロジックの実装。バリデーション・Folgezettel採番・Fleeting処理等

**配置ファイル**:
- `[ServiceName].ts`: 各サービスクラス

**命名規則**:
- パターン: `[EntityName]Service.ts`（PascalCase）
- 例: `NoteService.ts`, `LinkService.ts`, `FolgezettelService.ts`

**依存関係**:
- 依存可能: `repositories/`, `shared/`
- 依存禁止: `ipc/`, `renderer/`

**例**:
```
services/
├── NoteService.ts
├── LinkService.ts
├── FolgezettelService.ts
├── ReviewService.ts
└── SearchService.ts
```

---

#### src/main/repositories/

**役割**: SQLiteへのCRUD操作の抽象化。ビジネスロジックを含まない

**配置ファイル**:
- `[EntityName]Repository.ts`: 各エンティティのDBアクセスクラス

**命名規則**:
- パターン: `[EntityName]Repository.ts`（PascalCase）
- 例: `NoteRepository.ts`, `LinkRepository.ts`

**依存関係**:
- 依存可能: `db/`, `shared/`
- 依存禁止: `services/`, `ipc/`（上位レイヤーへの依存禁止）

**例**:
```
repositories/
├── NoteRepository.ts
├── LinkRepository.ts
└── SourceTagRepository.ts
```

---

#### src/main/db/

**役割**: SQLiteスキーマ定義・マイグレーション管理

**配置ファイル**:
- `schema.sql`: テーブル定義
- `migrations/[バージョン番号]_[説明].sql`: マイグレーションファイル
- `database.ts`: DB接続・初期化

**例**:
```
db/
├── schema.sql
├── database.ts
└── migrations/
    ├── 001_initial.sql
    └── 002_add_fts.sql
```

---

#### src/main/utils/

**役割**: ロギング・フォーマット等の汎用ユーティリティ

**配置ファイル**:
- `logger.ts`: アプリ全体で使うロガー（ログレベル管理・ファイル出力）
- `formatId.ts`: Folgezettel IDのフォーマット処理（必要に応じて追加）

**命名規則**:
- ファイル: camelCase（`logger.ts`, `formatId.ts`）

**依存関係**:
- 依存可能: `shared/`（型定義のみ）
- 依存禁止: `services/`, `repositories/`, `ipc/`

**例**:
```
utils/
├── logger.ts
└── formatId.ts
```

---

### src/renderer/ （Renderer Process）

#### src/renderer/components/

**役割**: 再利用可能なUIコンポーネント

**命名規則**:
- ファイル: PascalCase（`NoteEditor.tsx`）
- ディレクトリ: 機能単位でまとめる

**例**:
```
components/
├── editor/
│   ├── NoteEditor.tsx
│   ├── LinkSuggest.tsx
│   └── SourceTagInput.tsx
├── folgezettel/
│   ├── FolgezettelBadge.tsx
│   └── FolgezettelPicker.tsx
├── graph/
│   └── LinkGraph.tsx
├── review/
│   └── ReviewQueue.tsx
└── common/
    ├── NoteTypeBadge.tsx
    └── ValidationError.tsx
```

---

#### src/renderer/pages/

**役割**: ページ単位のトップレベルコンポーネント

**例**:
```
pages/
├── Home.tsx
├── NoteList.tsx
├── NoteDetail.tsx
├── ReviewFlow.tsx
├── GraphView.tsx
└── Search.tsx
```

---

#### src/renderer/stores/

**役割**: Zustand を使った状態管理

**命名規則**:
- パターン: `use[Entity]Store.ts`（camelCase）
- 例: `useNoteStore.ts`, `useUIStore.ts`

| ストア | 管理する状態 |
|--------|----------|
| `useNoteStore` | ノート一覧・選択中ノート・編集状態 |
| `useLinkStore` | リンク一覧・バックリンク |
| `useUIStore` | モーダル表示・エラートースト・ローディング状態 |

---

#### src/renderer/hooks/

**役割**: 状態取得・IPC呼び出し・副作用処理を抽象化したカスタムReact Hook

**命名規則**:
- パターン: `use[Name].ts`（camelCase）
- 例: `useNoteList.ts`, `useLinkSuggest.ts`

**依存関係**:
- 依存可能: `stores/`, `preload/`（`window.api.*` 経由）, `shared/`
- 依存禁止: `repositories/`（IPC経由のみ許可）

**例**:
```
hooks/
├── useNoteList.ts       # ノート一覧取得・フィルタリング
├── useLinkSuggest.ts    # リンク候補のデバウンス検索
├── useDraftSave.ts      # 30秒ごとのドラフト自動保存
└── useStaleNotes.ts     # 7日超のFleeting Note検出
```

---

### src/preload/

**役割**: Main Process と Renderer Process 間のIPC通信を安全に橋渡する（contextBridge経由）

**配置ファイル**:
- `index.ts`: IPC APIの公開定義（`window.api.*` として公開）

**命名規則**:
- ファイル: camelCase（`index.ts`）

**依存関係**:
- 依存可能: `shared/`（型定義のみ）
- 依存禁止: `services/`, `repositories/`, `renderer/`（セキュリティ上の理由）

**例**:
```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { Note } from '../shared/types';

contextBridge.exposeInMainWorld('api', {
  notes: {
    create: (input: Partial<Note>) => ipcRenderer.invoke('note:create', input),
    getByType: (type: string) => ipcRenderer.invoke('note:getByType', { type }),
  },
  links: {
    add: (fromNoteId: string, toNoteId: string) =>
      ipcRenderer.invoke('link:add', { fromNoteId, toNoteId }),
    suggest: (query: string, excludeNoteId: string) =>
      ipcRenderer.invoke('link:suggest', { query, excludeNoteId }),
  },
});
```

---

### src/shared/

**役割**: Main / Renderer 両方で使う TypeScript 型定義（IPC通信の型等）

**例**:
```typescript
// shared/types.ts
export type NoteType = 'fleeting' | 'literature' | 'permanent' | 'index';
export interface Note { ... }
export interface Link { ... }
export interface IPCResult<T> { success: boolean; data?: T; error?: string; }
```

---

## ファイル配置規則

### CI / Workflowファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|---|---|---|---|
| GitHub Actions テスト | .github/workflows/ | `[purpose].yml` | `test.yml` |
| GitHub Actions リリース | .github/workflows/ | `[purpose].yml` | `release.yml` |

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|---|---|---|---|
| IPCハンドラー | src/main/ipc/ | `[Entity]Handlers.ts` | `NoteHandlers.ts` |
| サービスクラス | src/main/services/ | `[Entity]Service.ts` | `NoteService.ts` |
| リポジトリクラス | src/main/repositories/ | `[Entity]Repository.ts` | `NoteRepository.ts` |
| ユーティリティ | src/main/utils/ | `[name].ts` | `logger.ts` |
| Reactコンポーネント | src/renderer/components/ | `[Name].tsx` | `NoteEditor.tsx` |
| ページコンポーネント | src/renderer/pages/ | `[Name].tsx` | `Home.tsx` |
| Zustandストア | src/renderer/stores/ | `use[Name]Store.ts` | `useNoteStore.ts` |
| カスタムフック | src/renderer/hooks/ | `use[Name].ts` | `useNoteList.ts` |
| 共通型定義 | src/shared/ | `types.ts` | `types.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|---|---|---|---|
| ユニットテスト（Main） | tests/unit/main/services/ | `[対象].test.ts` | `NoteService.test.ts` |
| ユニットテスト（Renderer） | tests/unit/renderer/components/ | `[対象].test.tsx` | `NoteEditor.test.tsx` |
| 統合テスト | tests/integration/ | `[機能].test.ts` | `note-crud.test.ts` |
| E2Eテスト | tests/e2e/ | `[シナリオ].spec.ts` | `quick-capture.spec.ts` |

---

## 命名規則サマリー

| 対象 | 規則 | 例 |
|---|---|---|
| クラス・インターフェース | PascalCase | `NoteService`, `Note` |
| ファイル（クラス） | PascalCase | `NoteService.ts` |
| ファイル（関数・ユーティリティ） | camelCase | `formatId.ts` |
| ディレクトリ | kebab-case | `source-tags/` |
| 定数 | UPPER_SNAKE_CASE | `MAX_TITLE_LENGTH` |
| Reactコンポーネントファイル | PascalCase | `NoteEditor.tsx` |
| Zustandストア | camelCase prefix `use` | `useNoteStore.ts` |

---

## 依存関係のルール

```
Renderer Process
    ↓ IPC
IPC Handlers
    ↓
Service層
    ↓
Repository層
    ↓
SQLite
```

**禁止される依存**:
- Repository → Service（上位レイヤーへの参照禁止）❌
- Service → IPC Handlers ❌
- Renderer → Repository（IPC経由のみ許可）❌
- 循環依存（すべて禁止）❌

---

## スケーリング戦略

### ディレクトリの分割基準

| ディレクトリ | 分割閾値 | 分割方法 |
|---|---|---|
| `services/` | 10ファイル超 | 機能単位でサブディレクトリ化（例: `services/notes/`, `services/review/`） |
| `components/` | 既に機能別に分割済み | editor/, folgezettel/, graph/, review/, common/ を維持する |
| `repositories/` | 制限なし | Entity単位のため分割不要 |

### ノート数増加への対応

- 10,000ノートまで: 現行構成のまま（SQLite + FTS5が充分対応する）
- 10,000ノート超: FTS5インデックスの最適化を検討（[architecture.md](architecture.md)参照）

---

## 検証方法

### 依存関係の検証

**手動チェックリスト**:
- [ ] `services/` から `ipc/` をimportしていないか
- [ ] `repositories/` から `services/` をimportしていないか
- [ ] `renderer/` から `repositories/` を直接importしていないか

### ファイル配置の検証

```bash
# サービスクラスの命名規則確認
ls src/main/services/*.ts | grep -v 'Service\.ts$' && echo "命名規則違反あり" || echo "OK"

# 期待ファイル数の確認
ls -1 src/main/services/*.ts 2>/dev/null | wc -l
# 期待: 5（NoteService, LinkService, FolgezettelService, ReviewService, SearchService）
```

### 実装時のチェックリスト

新規ファイル作成時:
- [ ] ファイル名が命名規則に従っているか
- [ ] 配置ディレクトリが正しいか
- [ ] import文が依存関係ルールに違反していないか
- [ ] テストファイルも同時に作成しているか
