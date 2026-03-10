# 技術仕様書 (Architecture Design Document)

## テクノロジースタック

### 言語・ランタイム

| 技術 | バージョン |
|---|---|
| Node.js | v24.11.0 |
| TypeScript | 5.x |
| npm | 11.x |

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 選定理由 |
|---|---|---|---|
| Electron | 最新安定版 | デスクトップアプリ基盤 | クロスプラットフォーム・グローバルショートカット対応 |
| React | 18.x | UIフレームワーク | コンポーネント設計・状態管理 |
| better-sqlite3 | 最新安定版 | SQLiteクライアント | 同期API・高速ローカルDB |
| CodeMirror | 6.x | Markdownエディター | 拡張可能・リンクサジェスト対応 |
| D3.js | 7.x | リンクグラフ可視化 | 柔軟なノード/エッジ描画 |
| Zustand | 4.x | 状態管理 | 軽量・TypeScript親和性 |

### 開発ツール

| 技術 | バージョン | 用途 | 選定理由 |
|---|---|---|---|
| Vite | 5.x | バンドラー（Renderer） | 高速HMR・Electron対応 |
| electron-builder | 最新安定版 | アプリパッケージング | クロスプラットフォームビルド |
| Vitest | 最新安定版 | テストフレームワーク | Viteとの統合・高速 |
| ESLint + Prettier | 最新安定版 | Lint・フォーマット | コード品質統一 |

---

## アーキテクチャパターン

### Electronのプロセス構成

```
┌─────────────────────────────────────────────────────┐
│  Electronアプリ                                       │
│                                                       │
│  ┌──────────────────────┐  ┌────────────────────┐   │
│  │  Main Process        │  │  Renderer Process  │   │
│  │  (Node.js環境)       │  │  (ブラウザ環境)    │   │
│  │                      │  │                    │   │
│  │  - SQLite操作        │  │  - React UI        │   │
│  │  - ファイルI/O       │  │  - エディター      │   │
│  │  - グローバルショート │  │  - グラフ表示      │   │
│  │    カット登録        │  │  - 状態管理        │   │
│  │  - Service層        │  │                    │   │
│  └──────────┬───────────┘  └────────┬───────────┘   │
│             │     IPC通信            │               │
│             └───────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

### レイヤードアーキテクチャ（Main Process内）

```
┌─────────────────────────┐
│   IPC Handlersレイヤー   │ ← Renderer からの要求を受け取る
├─────────────────────────┤
│   Serviceレイヤー        │ ← ビジネスロジック（NoteService等）
├─────────────────────────┤
│   Repositoryレイヤー     │ ← SQLite操作の抽象化
├─────────────────────────┤
│   SQLite（better-sqlite3）│ ← データ永続化
└─────────────────────────┘
```

#### IPC Handlersレイヤー
- **責務**: Renderer から IPC 経由で受け取った要求をServiceに委譲、結果を返す
- **許可される操作**: Serviceレイヤーの呼び出し
- **禁止される操作**: SQLiteへの直接アクセス・ビジネスロジックの実装

#### Serviceレイヤー
- **責務**: ビジネスロジック（バリデーション・Folgezettel採番・Fleeting処理等）
- **許可される操作**: Repositoryレイヤーの呼び出し
- **禁止される操作**: IPC・UIへの依存

#### Repositoryレイヤー
- **責務**: SQLiteへのCRUD操作・クエリ
- **許可される操作**: SQLite操作のみ
- **禁止される操作**: ビジネスロジックの実装

---

## データ永続化戦略

### ストレージ方式

| データ種別 | ストレージ | フォーマット | 理由 |
|---|---|---|---|
| ノート・リンク・タグ | SQLite | テーブル形式 | リンク管理・全文検索・ID管理に適合 |
| 編集中ドラフト | Electron localStorage | JSON | 軽量・高速・DBトランザクション不要 |
| アプリ設定 | electron-store | JSON | 型安全な設定管理 |
| ログ | ファイル（.log） | テキスト | デバッグ用 |

### データファイルの保存場所

```
# macOS
~/Library/Application Support/Zettelkastener/
├── zettelkastener.db    # SQLiteデータベース
├── config.json          # アプリ設定
└── logs/                # ログファイル

# Linux
~/.config/Zettelkastener/
├── zettelkastener.db
├── config.json
└── logs/
```

### バックアップ戦略

- **方式**: SQLiteの `.backup()` API を使用
- **頻度**: アプリ起動時に1回 + 24時間ごと
- **保存先**: データディレクトリ内 `backups/`
- **世代管理**: 最新7世代を保持
- **復元方法**: バックアップファイルを `zettelkastener.db` に上書き

---

## パフォーマンス要件

### レスポンスタイム

| 操作 | 目標時間 | 測定環境 |
|---|---|---|
| クイックキャプチャ起動 | 1秒以内 | 一般的なPC（M1 Mac相当） |
| Permanent Note 保存 | 500ms以内 | 同上 |
| 全文検索（100ノート） | 1秒以内 | 同上 |
| グラフ描画（500ノート） | 3秒以内 | 同上 |
| リンクサジェスト表示 | 200ms以内 | 同上 |

### リソース使用量

| リソース | 上限 | 理由 |
|---|---|---|
| メモリ（通常時） | 200MB | Electronの標準的なフットプリント |
| SQLiteファイルサイズ | 制限なし（実用上1GB以下想定） | テキスト主体のため問題なし |
| CPU（アイドル時） | 1%以下 | バックグラウンド常駐を考慮 |

> **single source of truth**: パフォーマンスの詳細基準・測定環境・上限値は本セクションを正本とし、他ドキュメントは本セクションを参照する。

---

## セキュリティアーキテクチャ

### データ保護

- **暗号化**: MVP段階では非暗号化ローカルファイル（将来的にSQLite暗号化拡張を検討）
- **アクセス制御**: OSのファイルパーミッションに依存
- **機密情報管理**: APIキー等は使用しない（ローカルオンリー設計）

### Electronセキュリティ設定

```typescript
// Main Processの推奨設定
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Node.jsをRenderer側で無効化
    contextIsolation: true,        // コンテキスト分離を有効化
    preload: path.join(__dirname, 'preload.js'), // IPC橋渡し
  },
});
```

### 入力検証

- **バリデーション**: Serviceレイヤーでビジネスルールを検証（種別制約・リンク必須等）
- **サニタイゼーション**: Markdownレンダリング時にXSS対策（DOMPurify等）
- **SQLインジェクション対策**: better-sqlite3のパラメータバインディングを使用（文字列結合禁止）

---

## スケーラビリティ設計

### データ増加への対応

- **想定データ量**: 10,000ノートまでで十分なパフォーマンスを確保
- **全文検索**: SQLite FTS5仮想テーブルを使用（大量データでも高速）
- **グラフ描画**: 500ノード以上はD3.jsのforce simulationを最適化（WebWorker利用を検討）
- **アーカイブ**: MVP段階では非対応。将来的にFleeting Noteの自動アーカイブを検討

### 機能拡張性

- **スマホPWA**: P1機能として、Renderer側のReactコンポーネントを流用したFleeting Note専用PWAをMVPコア完了後の後続フェーズで構築予定。自動同期は対象外
- **プラグイン**: MVP段階では非対応
- **エクスポート**: Markdown形式への変換をP2で実装（SQLite → ファイル群）

---

## IPC API設計

### チャネル命名規則

`<entity>:<action>` 形式。例: `note:create`, `link:suggest`

### ペイロード構造

```typescript
// リクエスト例
ipcRenderer.invoke('note:create', { type: 'fleeting', content: '...' });

// レスポンス（成功）
{ success: true, data: { id: '...', ... } }

// レスポンス（失敗）
{ success: false, error: { message: '...', code: 'VALIDATION_ERROR' } }
```

### ノート操作API

| チャネル名 | リクエスト | レスポンス | エラー |
|-----------|-----------|-----------|--------|
| `note:create` | `CreateNoteInput` | `Note` | `VALIDATION_ERROR` \| `DATABASE_ERROR` |
| `note:update` | `{ id: string, input: UpdateNoteInput }` | `Note` | `NOT_FOUND` \| `VALIDATION_ERROR` |
| `note:delete` | `{ id: string }` | `void` | `NOT_FOUND` |
| `note:getById` | `{ id: string }` | `Note \| null` | - |
| `note:getByType` | `{ type: NoteType }` | `Note[]` | - |
| `note:getUnprocessedFleeting` | - | `Note[]` | - |
| `note:getStaleFleeting` | `{ days: number }` | `Note[]` | - |
| `note:promote` | `{ fleetingId: string, targetType: 'permanent' \| 'literature', input: PromoteInput }` | `Note` | `NOT_FOUND` \| `VALIDATION_ERROR` |

### リンク操作API

| チャネル名 | リクエスト | レスポンス | エラー |
|-----------|-----------|-----------|--------|
| `link:add` | `{ fromNoteId: string, toNoteId: string }` | `Link` | `VALIDATION_ERROR` |
| `link:remove` | `{ id: string }` | `void` | `NOT_FOUND` |
| `link:getLinks` | `{ noteId: string }` | `{ outgoing: Link[], incoming: Link[] }` | - |
| `link:suggest` | `{ query: string, excludeNoteId: string }` | `Note[]` | - |
| `link:getIsolatedNotes` | - | `Note[]` | - |

### Folgezettel API

| チャネル名 | リクエスト | レスポンス | エラー |
|-----------|-----------|-----------|--------|
| `folgezettel:assignId` | `{ parentFolgezettelId: string \| null, existingSiblingIds: string[] }` | `string` | `OVERFLOW_ERROR` |
| `folgezettel:getChildren` | `{ folgezettelId: string }` | `Note[]` | - |

### 検索API

| チャネル名 | リクエスト | レスポンス | エラー |
|-----------|-----------|-----------|--------|
| `search:search` | `{ query: string, options?: SearchOptions }` | `SearchResult[]` | - |

### レビューAPI

| チャネル名 | リクエスト | レスポンス | エラー |
|-----------|-----------|-----------|--------|
| `review:getQueue` | - | `Note[]` | - |
| `review:getStaleNotes` | `{ days: number }` | `Note[]` | - |
| `review:convertAndDelete` | `{ fleetingId: string, targetType: 'permanent' \| 'literature', input: CreateNoteInput }` | `Note` | `NOT_FOUND` \| `VALIDATION_ERROR` |
| `review:deleteAsFleeting` | `{ id: string }` | `void` | `NOT_FOUND` |

### エラーコード定義

| コード | 意味 |
|--------|------|
| `VALIDATION_ERROR` | ビジネスルール違反（ユーザーが修正可能） |
| `NOT_FOUND` | 対象リソースが存在しない |
| `DATABASE_ERROR` | DB操作失敗（リトライを促す） |
| `OVERFLOW_ERROR` | Folgezettelが26件/9件の上限超過 |
| `SYSTEM_ERROR` | 予期しないエラー |

---

## エラーハンドリング戦略

> **エラークラス定義の正本**: `AppError`, `ValidationError`, `NoteNotFoundError` などの実装定義は [docs/development-guidelines.md](development-guidelines.md#エラーハンドリング) を参照する。本セクションではエラーの分類、通知方針、ログレベル、リトライ戦略のみを定義する。

### エラー分類

| エラー種別 | ハンドリング | ユーザー通知 | ログレベル |
|-----------|------------|------------|----------|
| `ValidationError` | ユーザーが修正可能 | エラーメッセージ + 解決策を表示 | INFO |
| `DatabaseError` | SQLiteロック・ディスク不足等 | 「保存に失敗しました。再試行してください」 | ERROR |
| `NotFoundError` | 存在しないリソースへのアクセス | 「ノートが見つかりません」 | WARN |
| `SystemError` | 予期しないエラー | 「予期しないエラーが発生しました」 | FATAL |

### エラー処理フロー

```
Service層でエラーをcatch → 分類されたエラーオブジェクトをthrow
    ↓
IPC Handlers でcatch → { success: false, error: { code, message } } をRendererに返却
    ↓
Renderer側でToastまたはモーダルでユーザーに表示
```

### DatabaseErrorのリトライ戦略

- SQLiteロック等の一時的エラー: 最大3回、100ms間隔でリトライ
- リトライ後も失敗した場合は `DATABASE_ERROR` をRendererに返す

---

## Renderer Processアーキテクチャ

```
┌─────────────────────────┐
│   React Components      │ ← UI表示・ユーザー操作
├─────────────────────────┤
│   Zustand Store         │ ← 状態管理（notes, links, UI状態）
├─────────────────────────┤
│   IPC Client            │ ← Main Processへの通信抽象化（preload経由）
└─────────────────────────┘
```

### Zustand Store設計

| ストア | 管理する状態 |
|--------|------------|
| `useNoteStore` | ノート一覧・選択中ノート・編集状態 |
| `useLinkStore` | リンク一覧・バックリンク |
| `useUIStore` | モーダル表示・エラートースト・ローディング状態 |

- `useNoteStore` と `useLinkStore` の永続データは `Record<string, Entity>` を基本形とする正規化ストアで保持し、一覧表示順やフィルタ結果のみを配列で派生させる
- Renderer 側ではノート本文やリンクの正本を重複保持せず、IPCレスポンスを受けて正規化ストアを更新する
- 画面ローカルな入力途中状態（例: 検索クエリ、モーダル開閉、未保存フォーム値）は `useUIStore` またはコンポーネントローカル state に閉じ込める

### コンポーネント設計原則

- **Presentational / Container パターン**: UIとロジックを分離
- ビジネスロジックはMain側で実行（Renderer側はUI更新のみ）
- `preload/index.ts` 経由でIPCを呼び出す（`window.api.*`）

---

## Folgezettel ID採番アルゴリズム

Folgezettel採番ロジックの詳細（採番ルール、採番例、エッジケース）は [docs/functional-design.md](functional-design.md) の `FolgezettelService（ID採番）` セクションを正本とする。

本ドキュメントでは以下のみを責務として定義する:

- 採番処理は Main Process の `FolgezettelService` で実行する
- 上限超過時は `OVERFLOW_ERROR` を返し、Renderer に手動再配置を促す
- Renderer からは `folgezettel:assignId` IPC API 経由で利用する

---

## デプロイメント戦略

### ビルド

```bash
npm run build    # Renderer（Vite）+ Main（tsc）のコンパイル
npm run dist     # electron-builderで実行ファイル生成
```

### ターゲットプラットフォーム（MVP）

| プラットフォーム | 形式 | 対象CPUアーキテクチャ |
|----------------|------|------------------|
| macOS | dmg | Apple Silicon + Intel |
| Linux | AppImage | x64 |

> **注意**: Windows対応はMVP段階のスコープ外。

### 配布

- GitHub Releasesでバイナリ配布
- MVP段階では自動更新なし（手動ダウンロード）
- コード署名: MVP段階は未対応（将来的にApple Developer IDを取得）

---

## テスト戦略

### ユニットテスト
- **フレームワーク**: Vitest
- **対象**: Serviceレイヤー全体・FolgezettelService（採番アルゴリズム）・バリデーションロジック
- **カバレッジ目標**: [docs/development-guidelines.md](development-guidelines.md#テストカバレッジ目標)を参照

### 統合テスト
- **対象**: Service + Repository + SQLite + IPC Handlers（実際のDBに対してテスト）
- **方式**: テスト用のインメモリSQLiteを使用（`:memory:`）
- **補足**: IPC Handlers はチャネル単位で主要正常系・異常系を統合テストでカバーする

### E2Eテスト
- **フレームワーク**: Playwright（Electron対応）
- **対象**: 主要ワークフロー（クイックキャプチャ→保存、Fleeting→Permanent変換）
- **MVP段階**: 主要フロー3件のみ

### テスト実行

```bash
npm test          # ユニット・統合テスト
npm run test:e2e  # Playwright E2Eテスト
npm run coverage  # カバレッジレポート
```
