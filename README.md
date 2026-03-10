# Zettelkastener

Zettelkasten方法論に特化したデスクトップエディター。「即座に書ける」と「Zettelkastenのルールを守る」を両立します。

> 既存ツール（Obsidian, Logseq, Notion）はZettelkastenのルールを何も強制しません。Zettelkastenerはノート種別・リンク・出典タグをシステムレベルで強制し、実践者が「正しくできているか不安」にならずに続けられる環境を作ります。

---

## 動作環境

| 項目 | バージョン |
|------|-----------|
| Node.js | v24以上 |
| OS | macOS / Linux |
| アーキテクチャ | x64 / arm64 |

---

## セットアップ

### インストール

```bash
git clone https://github.com/liverpl1920/Zettelkastener.git
cd Zettelkastener
npm install
# Electronのネイティブモジュールをリビルド
npx electron-rebuild -f -w better-sqlite3
```

### 開発サーバー起動

```bash
npm run dev
```

アプリが起動し、メインウィンドウが表示されます。

---

## 使い方

### クイックキャプチャ（即時メモ入力）

アイデアが浮かんだ瞬間、**どのアプリを使っていても**メモをキャプチャできます。

1. **`Ctrl+Shift+N`**（macOSは `Cmd+Shift+N`）を押す
2. クイックキャプチャウィンドウが最前面に表示される
3. すぐに書き始める（タイトル・分類・保存場所の決断は不要）
4. **`Ctrl+Enter`** で Fleeting Note として保存

| ショートカット | 操作 |
|--------------|------|
| `Ctrl+Shift+N` | クイックキャプチャを開く（グローバル） |
| `Ctrl+Enter` | 保存して閉じる |
| `Esc` | キャンセルして閉じる |

> **ポイント**: デフォルトは Fleeting Note です。Literature / Permanent への変換は後でメイン画面から行います。

---

## ノート種別

Zettelkastenerはノートを4種類に分類し、種別ごとの保存制約をツールが強制します。

| 種別 | 保存制約 | 説明 |
|------|---------|------|
| **Fleeting Note** | なし | とりあえずのメモ。後で変換か削除する |
| **Literature Note** | 出典タグ必須 | 文献を読みながら自分の言葉で書いたメモ |
| **Permanent Note** | リンク最低1つ必須 | 単独で理解できる恒久ノート |
| **Index (MoC)** | リンク最低1つ必須 | テーマ別のPermanent Noteへの入り口 |

### Zettelkastenの基本フロー

> **実装状況**: 現在は Step 1（クイックキャプチャ）のみ実装済みです。Step 2 以降のレビュー・変換UIは開発中です。

```
【Step 1 ✅ 実装済み】
アイデアが浮かぶ
    ↓
Ctrl+Shift+N → Fleeting Note に即キャプチャ

【Step 2 🚧 開発中】
メイン画面で Fleeting Note を一覧表示
    ↓
┌─ そのまま削除（不要なら）
├─ Literature Note へ変換（文献から触発された思考なら）
└─ Permanent Note へ変換（定着させたい知識なら）
                ↓
        他のPermanent Note へリンク（必須）
                ↓
        知識ネットワークが育つ
```

---

## 開発コマンド

```bash
# 開発サーバー起動（初回または npm test 実行後はこちら）
npm run dev:setup   # Electron 用にリビルド → 起動

# 開発サーバー起動（electron-rebuild 済みの場合）
npm run dev

# テスト実行（Node.js 用にリビルドして実行）
npm run rebuild:node && npm test

# 型チェック
npm run typecheck

# Lint
npm run lint

# プロダクションビルド
npm run build

# インストーラー生成（build後）
npm run dist
```

> **注意**: `better-sqlite3` はネイティブモジュールのため、Electron（`npm run dev`）とVitest（`npm test`）で別々のビルドが必要です。
> - Electron用: `npm run rebuild:electron`
> - Node.js/テスト用: `npm run rebuild:node`

---

## プロジェクト構成

```
src/
├── main/              # Electron Main Process
│   ├── db/            # SQLite接続・マイグレーション
│   ├── ipc/           # IPCハンドラー
│   ├── repositories/  # DBアクセス層
│   ├── services/      # ビジネスロジック
│   ├── utils/         # ロガー等
│   └── windows/       # ウィンドウ管理
├── preload/           # contextBridge
├── renderer/          # React UI
│   ├── components/
│   ├── hooks/
│   └── stores/        # Zustand
└── shared/            # Main/Renderer共通型定義

docs/                  # 設計ドキュメント
tests/
├── unit/              # ユニットテスト（Vitest）
└── integration/       # 統合テスト
```

---

## ドキュメント

詳細な設計は `docs/` を参照してください。

| ファイル | 内容 |
|---------|------|
| [product-requirements.md](docs/product-requirements.md) | プロダクト要求定義書 |
| [functional-design.md](docs/functional-design.md) | 機能設計書 |
| [architecture.md](docs/architecture.md) | 技術アーキテクチャ |
| [development-guidelines.md](docs/development-guidelines.md) | 開発ガイドライン |
| [glossary.md](docs/glossary.md) | 用語集（Zettelkasten用語含む） |
| [repository-structure.md](docs/repository-structure.md) | リポジトリ構造定義 |
