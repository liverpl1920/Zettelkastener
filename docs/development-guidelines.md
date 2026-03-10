# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// ✅ 良い例
const unprocessedFleetingNotes = await noteService.getUnprocessedFleeting();
function assignFolgezettelId(parentId: string | null): string { }
const isValidPermanentNote = (note: Note): boolean => { };

// ❌ 悪い例
const data = await noteService.get();
function assign(id: any): any { }
```

**原則**:
- 変数: camelCase、名詞または名詞句
- 関数: camelCase、動詞で始める（`get`, `create`, `validate`, `assign` 等）
- 定数: UPPER_SNAKE_CASE
- Boolean: `is`, `has`, `should`, `can` で始める

#### クラス・インターフェース・型

```typescript
// クラス: PascalCase、名詞
class NoteService { }
class FolgezettelService { }

// インターフェース: PascalCase（I接頭辞なし）
interface Note { }
interface ValidationResult { }

// 型エイリアス: PascalCase
type NoteType = 'fleeting' | 'literature' | 'permanent' | 'index';
type FolgezettelId = string;
```

---

### コードフォーマット

- **インデント**: 2スペース
- **行の長さ**: 最大100文字
- **セミコロン**: あり
- **クォート**: シングルクォート（文字列）
- **自動フォーマット**: Prettier を使用（保存時に自動適用）
- **pre-commitフック**: `husky` + `lint-staged` を使用し、コミット時に自動で Prettier と ESLint を実行する

```json
// .lintstagedrc
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

---

### コメント規約

#### 関数・クラスのドキュメント

```typescript
/**
 * Luhmann式IDを採番する
 *
 * @param parentFolgezettelId - 派生元のFolgezettel ID。null の場合はトップレベル連番
 * @param existingSiblingIds - 同じ親を持つ既存のID一覧（重複防止）
 * @returns 新しいFolgezettel ID（例: "1a", "1a1"）
 * @throws {OverflowError} サブノードが26件を超えた場合
 */
function assignFolgezettelId(
  parentFolgezettelId: string | null,
  existingSiblingIds: string[]
): string { }
```

#### インラインコメント

```typescript
// ✅ 良い例: なぜそうするかを説明
// Permanent Noteは保存後に自律性確認プロンプトを表示する必要があるため、
// バリデーション成功後も即座にDBに書き込まない
const validationResult = noteService.validate(note);

// ❌ 悪い例: コードを読めば分かることを書く
// バリデーション実行
const validationResult = noteService.validate(note);
```

---

### エラーハンドリング

```typescript
// ドメイン固有のエラークラスを定義（以下が正式定義—本ドキュメントで管理）
class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly suggestion: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class NoteNotFoundError extends AppError {
  constructor(public readonly noteId: string) {
    super(`Note not found: ${noteId}`, 'NOT_FOUND');
    this.name = 'NoteNotFoundError';
  }
}

class OverflowError extends AppError {
  constructor(public readonly folgezettelId: string) {
    super(`Folgezettel overflow at: ${folgezettelId}`, 'OVERFLOW_ERROR');
    this.name = 'OverflowError';
  }
}

class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// エラーハンドリングの基本パターン
try {
  const note = noteService.create(input);
} catch (error) {
  if (error instanceof ValidationError) {
    // ユーザーにフィードバック（UIレイヤーで処理）
    showValidationError(error.field, error.message, error.suggestion);
  } else {
    // 予期しないエラーはログに記録して上位に伝播
    logger.error('Unexpected error in noteService.create', error);
    throw error;
  }
}
```

**原則**:
- エラーを `catch` してログも出さず無視することは禁止
- ユーザーに見せるエラーメッセージは必ず「❌ 問題 + 💡 解決策」の形式で提示する
- 予期しないエラーは上位レイヤーに伝播させる

---

### TypeScript固有のルール

```typescript
// ✅ 型注釈を明示する（return typeを含む）
function getLinkCount(noteId: string): number {
  return linkRepository.countByNoteId(noteId);
}

// ❌ any型の使用禁止（型が不明な場合は unknown を使い、型ガードを書く）
function handleInput(data: any) { } // ❌
function handleInput(data: unknown) { // ✅
  if (typeof data === 'string') { ... }
}

// ✅ null/undefinedの明示（strictNullChecks: true 前提）
function findNote(id: string): Note | null {
  return noteRepository.findById(id) ?? null;
}
```

---

### Reactコンポーネント規約

```tsx
// ✅ Props型は明示し、コンポーネント外で宣言する
interface NoteEditorProps {
  noteId: string;
  isReadOnly?: boolean;
  onSave: (content: string) => void;
}

export function NoteEditor({ noteId, isReadOnly = false, onSave }: NoteEditorProps) {
  return <section aria-label="note-editor">...</section>;
}

// ❌ Propsをanyで受ける
export function NoteEditor(props: any) {
  return <div>{props.noteId}</div>;
}
```

**原則**:
- Props は `interface` または `type` で明示し、コンポーネント外に定義する
- 1ファイル1コンポーネントを原則とし、補助関数は同ファイル内 private function に留める
- JSX 内の分岐が3つを超える場合は子コンポーネントへ分割を検討する
- データ取得・IPC呼び出し・副作用はカスタム Hook または Container に寄せ、Presentational Component は表示責務に集中させる

#### Hooksのルール

- React Hooks はトップレベルでのみ呼び出す（条件分岐・ループ内禁止）
- `useEffect()` は「なぜ副作用が必要か」を説明できる場合のみ使い、導出可能な値は `useMemo()` や通常の計算へ寄せる
- IPC呼び出しを直接 JSX イベント内へ多重に書かず、`useCallback()` かカスタム Hook でまとめる

#### Presentational / Container 分離

```tsx
// Container: データ取得とイベント定義を担当
export function NoteDetailContainer({ noteId }: { noteId: string }) {
  const note = useNoteDetail(noteId);
  const { saveNote } = useNoteActions();

  return <NoteDetailView note={note} onSave={saveNote} />;
}

// Presentational: 表示に専念
interface NoteDetailViewProps {
  note: Note | null;
  onSave: (content: string) => void;
}

function NoteDetailView({ note, onSave }: NoteDetailViewProps) {
  return <div>{note?.title}</div>;
}
```

**分割基準**:
- Container が 150 行を超える場合はロジックを Hook に分離する
- Presentational Component が UI責務以外（データ取得・IPC呼び出し・永続化）を持ち始めたら分離する

---

## Git運用ルール

### ブランチ戦略

```
main
  └─ develop
      ├─ feature/quick-capture
      ├─ feature/folgezettel-id
      ├─ fix/validation-error-message
      └─ refactor/note-service
```

| ブランチ | 用途 |
|---|---|
| `main` | リリース可能な状態（直接コミット禁止） |
| `develop` | 開発の最新状態 |
| `feature/[機能名]` | 新機能開発 |
| `fix/[修正内容]` | バグ修正 |
| `refactor/[対象]` | リファクタリング |

### コミットメッセージ規約

**フォーマット**:
```
<type>(<scope>): <subject>

<body（任意）>
```

**Type**:

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `docs` | ドキュメント更新 |
| `chore` | ビルド・設定変更 |

**Scope**（主要なもの）:
- `note`, `link`, `folgezettel`, `review`, `search`, `graph`, `editor`, `capture`

**例**:
```
feat(capture): グローバルショートカットでクイックキャプチャを起動
fix(folgezettel): 同一親に26件超のサブノードを作成しようとした際のエラー処理を追加
refactor(note-service): バリデーションロジックをNoteValidatorクラスに分離
test(folgezettel-service): assignFolgezettelIdのエッジケーステストを追加
```

### プルリクエスト・マージ

- `feature/*` → `develop`: レビュー不要（個人プロジェクトのため）。ただし tests が通ること

#### セルフレビューチェックリスト

`feature/*` → `develop` マージ前に以下を自分で確認する:

- [ ] `npm test` が通ること
- [ ] `npm run typecheck` が通ること
- [ ] `npm run lint` が通ること
- [ ] 新規コードに適切なコメントがあること

`develop` → `main` マージ条件:

- [ ] `npm run test:e2e` が通ること（主要フロー3件: UC-1/UC-2/UC-3）
- [ ] 上記 `feature/*` → `develop` の全チェックリストを満たすこと
- マージ方式: **Squash merge**（featureブランチのコミットをまとめる）

---

## 開発フロー

### 環境セットアップ

#### devcontainerを使用する場合（推奨）

```bash
# 1. VS Codeでリポジトリを開く
# 2. コマンドパレットから "Reopen in Container" を選択
# 3. コンテナ内で以下を実行（Node.js v24.11.0が自動で用意される）
npm install
npm run typecheck   # 型チェック確認
npm test            # テスト実行確認
```

#### ローカル環境を使用する場合

```bash
# 1. Node.js v24.11.0をインストール（nvm推奨）
nvm install 24.11.0
nvm use 24.11.0

# 2. 依存関係をインストール
npm install

# 3. 開発サーバー起動
npm run dev
```

### 新機能実装の手順

1. `develop` から `feature/[機能名]` ブランチを切る
2. `.steering/` に作業計画を作成（`requirements.md`, `design.md`, `tasklist.md`）
3. 実装（Serviceレイヤーから実装し、IPCハンドラー・UIの順に組み上げる）
4. ユニットテストを書く
5. `npm test` が通ることを確認
6. `develop` にマージ

### ローカル開発環境の起動

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（Hot Reload有効）
npm run dev

# テスト実行
npm test

# 型チェック
npm run typecheck

# Lint
npm run lint
```

### 想定 npm scripts 一覧

| スクリプト | 用途 |
|---|---|
| `npm run dev` | Electron + Renderer の開発起動 |
| `npm run build` | Main / Renderer の本番用ビルド |
| `npm run dist` | `electron-builder` による配布物生成 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint 実行 |
| `npm test` | ユニットテスト・統合テスト |
| `npm run test:e2e` | Playwright E2E テスト |
| `npm run coverage` | カバレッジレポート生成 |

> `package.json` では上記スクリプト名を採用する前提でドキュメントを記述する。

### CI/CD

#### GitHub Actions（推奨設定）

`feature/*`, `develop`, `main` へのプッシュ時に以下を自動実行:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24.11.0'
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
```

テストが失敗した場合はマージをブロックする。

### Electronアプリのビルド

```bash
# 開発ビルド
npm run build

# 配布用パッケージ作成
npm run dist
```

---

## テスト規約

### ユニットテストの書き方

```typescript
// tests/unit/main/services/NoteService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoteService } from '../../../src/main/services/NoteService';

describe('NoteService', () => {
  describe('validate（Permanent Note）', () => {
    it('リンクが0件の場合はバリデーションエラーを返す', () => {
      // Arrange
      const note = { type: 'permanent', title: 'テスト', content: '...' };
      const links: Link[] = [];

      // Act
      const result = noteService.validate(note, links);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('links');
    });

    it('リンクが1件以上ある場合はバリデーションを通過する', () => {
      // ...
    });
  });
});
```

**テストの原則**:
- AAA（Arrange-Act-Assert）パターンを使用
- テスト名は「[条件]の場合は[期待する結果]」の形式
- 外部依存（DB等）はモックする（ユニットテスト）
- 統合テストでは実際のインメモリSQLiteを使用

### テストカバレッジ目標

| レイヤー | 目標カバレッジ |
|---------|-------------|
| Serviceレイヤー | 80%以上 |
| Repositoryレイヤー | 70%以上 |
| IPC Handlersレイヤー | 主要チャネルを統合テストで100%カバー |

```bash
npm run coverage   # coverage/index.html にレポート生成
```

### E2Eテストの書き方

```typescript
// tests/e2e/quick-capture.spec.ts
import { test, expect } from '@playwright/test';

test('クイックキャプチャからFleeting Note保存まで', async ({ page }) => {
  await page.click('[data-testid="quick-capture-menu"]');
  await page.fill('[data-testid="note-editor"]', 'テストメモ');
  await page.keyboard.press('Meta+Enter');
  await expect(page.locator('[data-testid="notification"]'))
    .toHaveText('Fleeting Noteを保存しました');
});
```

**MVP対象フロー**:
- UC-1: クイックキャプチャ → Fleeting Note保存
- UC-2: Permanent Noteのバリデーションと保存
- UC-3: Fleeting → Permanent変換

---

## 禁止事項

- `any` 型の使用（やむを得ない場合は `// eslint-disable-next-line` + コメントで理由を明記）
- Repository層でのビジネスロジックの実装
- IPC Handlers層でのSQLite直接アクセス
- `console.log` によるデバッグ出力をコミットに含める（logger を使うこと）
- エラーの握り潰し（空の catch ブロック禁止）
- 循環依存

---

## ロギング規約

### ロガーの使い方

```typescript
// ✅ 良い例: logger を使用
import { logger } from '../utils/logger';
logger.info('Note created', { noteId, type });
logger.error('Failed to save note', { noteId, error });

// ❌ 悪い例: console.log は禁止
console.log('note created', note);
```

### ログレベルの使い分け

| レベル | 用途 | 例 |
|-------|------|---|
| `error` | エラー・例外 | `logger.error('Failed to save note', { noteId, error });` |
| `warn` | 警告（通常パスではないが注目すべき状態） | `logger.warn('Note has no links', { noteId });` |
| `info` | 重要な処理の開始・完了 | `logger.info('Note created', { noteId, type });` |
| `debug` | デバッグ情報（開発時のみ） | `logger.debug('Validation result', { result });` |

**出力ルール**:
- 本番環境: `info` 以上のみを出力
- 開発環境: `debug` 以上を全て出力
