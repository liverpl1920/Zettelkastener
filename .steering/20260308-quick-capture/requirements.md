# 要求内容

## 概要

Zettelkastener プロジェクトの初期構築と、機能1「即時メモ入力（クイックキャプチャ）」を実装する。

## 背景

現時点で `src/` ディレクトリが存在せず、実装コードがない。機能1はP0の最優先機能であり、「アイデアが浮かんだ瞬間に1秒以内で書き始められる」体験の核心をなす。プロジェクト基盤（Electron + React + SQLite）を整備しつつ、クイックキャプチャの End-to-End フローを動作させる。

## 実装対象

### フェーズ0: プロジェクト初期構築

- `package.json` と依存関係の初期化（Electron, React, SQLite, TypeScript 等）
- TypeScript・Vite・ESLint・Prettier の設定ファイル
- devcontainer 設定
- `src/main/`, `src/renderer/`, `src/preload/`, `src/shared/` のディレクトリ骨格
- SQLite DB 初期化・スキーマ（`notes` テーブル）
- DB マイグレーション基盤

### フェーズ1: 機能1 実装（即時メモ入力）

**ユーザーストーリー**:
Zettelkasten実践者として、アイデアが浮かんだ瞬間にキャプチャするために、決断なしに即座に書き始められる入力モードが欲しい

**受け入れ条件**:
- [ ] グローバルショートカット（`Ctrl+Shift+N`）でクイックキャプチャウィンドウが開く
- [ ] 入力モード起動から書き始めるまで1秒以内（タイトル・分類不要）
- [ ] デフォルト種別は `fleeting` に自動設定
- [ ] `Ctrl+Enter` で Fleeting Note として即保存
- [ ] `Esc` で破棄・ウィンドウを閉じる
- [ ] 保存失敗時はエラートーストを表示し、入力内容はドラフトとして保持

## 技術スタック（architecture.md より）

| 技術 | バージョン |
|-----|----------|
| Electron | 最新安定版 |
| React | 18.x |
| better-sqlite3 | 最新安定版 |
| Zustand | 4.x |
| Vite | 5.x |
| TypeScript | 5.x |
| Vitest | 最新安定版 |

## スコープ外（今回）

- 機能2〜7（ノート種別制約・リンク・Folgezettel 等）
- ノート一覧・エディター画面
- 検索・グラフ表示

## 参照ドキュメント

- `docs/product-requirements.md` 機能1
- `docs/functional-design.md` NoteService, UC-1
- `docs/architecture.md` IPC API, データ永続化
- `docs/repository-structure.md` ディレクトリ構造
- `docs/development-guidelines.md` コーディング規約
