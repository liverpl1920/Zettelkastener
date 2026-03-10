# プロジェクト用語集 (Glossary)

## 概要

このドキュメントは、Zettelkastener プロジェクト内で使用される用語の定義を管理します。
Zettelkasten方法論の用語と、プロジェクト固有の技術用語を統一的に定義します。

**更新日**: 2026-03-08

---

## Zettelkastenドメイン用語

### Zettelkasten

**定義**: 「ノートの箱」を意味するドイツ語。Niklas Luhmannが発展させた知識管理システム。

**説明**: 独立したノートを相互リンクで繋ぐことで、知識を「保管」するのではなく「生成」することを目的とする。ノートが増えるほどネットワークが豊かになり、新しいアイデアが自然に生まれる環境を作る。

**関連用語**: Fleeting Note, Literature Note, Permanent Note, Folgezettel, Luhmann

**英語表記**: Zettelkasten（ドイツ語のまま使用）

---

### Fleeting Note

**定義**: アイデアが浮かんだ瞬間に素早くキャプチャする一時的なメモ。

**説明**: 整理・洗練は不要で「まず書く」ことを優先する。後でLiterature NoteまたはPermanent Noteに変換して削除するのが原則。削除せずに溜め込むのはZettelkastenの原則違反。

**関連用語**: Literature Note, Permanent Note, レビューフロー

**使用例**:
- 電車の中で思いついたアイデアをFleeting Noteに記録する
- 読書中に気になった箇所をFleeting Noteに書き留めておく

**英語表記**: Fleeting Note

---

### Literature Note

**定義**: 文献（書籍・論文・記事等）を読みながら、その場で自分の言葉で書いたメモ。

**説明**: 要約や引用ではなく「自分の解釈・思考」を書く。出典タグが必須。ZoteroやMendeley的な書誌情報管理ツールとは根本的に異なる。「読み終わった後にまとめる」のではなく、「読みながら書く」。

**関連用語**: Fleeting Note, Permanent Note, 出典タグ

**使用例**:
- 「Ahrensの主張は、ノートを書くこと自体が思考である、ということだと理解した」と書く（引用や要約ではない）

**英語表記**: Literature Note

---

### Permanent Note

**定義**: 自分の言葉で書いた恒久的なノート。知識ネットワークの構成要素。

**説明**: 単独で（他のノートを参照しなくても）理解できる「自律したノート」であることが求められる。少なくとも1つの他のPermanent Noteへのリンクが必須。Luhmann式IDが付与される。

**関連用語**: Fleeting Note, Literature Note, Folgezettel, リンク, 自律性

**英語表記**: Permanent Note

---

### Folgezettel

**定義**: 「後続ノート」を意味するドイツ語。Luhmannが考案した、既存ノートへの「続き」としてノートを展開する仕組み。

**説明**: 単なる連番ではなく、「どの思考の展開として生まれたか」を記録する。これによりノートの親子・兄弟関係（思考の連鎖）が可視化される。Zettelkastenerでは Permanent Note にのみ適用。

**使用例**:
- ノート `1` の続きとして `1a` を作成
- `1a` をさらに展開して `1a1` を作成
- ノート `1` の別の展開として `1b` を作成

**関連用語**: Luhmann式ID, Permanent Note

**英語表記**: Folgezettel（ドイツ語のまま使用）

---

### Luhmann式ID

**定義**: Folgezettelの概念に基づいた、英数字交互の階層型ID体系。

**説明**: `1`, `1a`, `1a1`, `1a1a`, `1b`, `2` ... のように、数字とアルファベットを交互に使って階層を表現する。IDのパターンからノートの「思考上の位置」が読み取れる。

**関連用語**: Folgezettel, Permanent Note

**英語表記**: Luhmann Numbering System

---

### 索引ノート（Map of Content / MoC）

**定義**: 特定のトピックへの入り口となる、関連Permanent Notesへのリンクをまとめたノート。

**説明**: Luhmannの索引ノート（Indexzettel）に相当する現代的な概念。独自のコンテンツは最小限で、「テーマ別の地図」として機能する。ノート数が増えた際の発見可能性を維持するために重要。

**関連用語**: Permanent Note, リンクグラフ

**英語表記**: Index Note / Map of Content (MoC)

---

### 1ノート1アイデアの原則

**定義**: 1つのノートには1つのアイデアまたは主張のみを書くというZettelkastenの核心原則。

**説明**: 文字数の多少は関係なく、「主張が1つかどうか」が判断基準。この原則を守ることでノートの再利用性・リンク可能性が高まる。

**関連用語**: Permanent Note, 分割フロー

**英語表記**: One Note, One Idea Principle

---

### ノートの自律性

**定義**: Permanent Noteが他のノートを参照しなくても単独で理解できる性質。

**説明**: 「このノートだけを読んで意味が分かるか？」が判断基準。文脈依存のノートが蓄積すると、後から読んだときに理解不能になる。Zettelkastenerでは保存時に確認プロンプトで意識付けを行う。

**関連用語**: Permanent Note, 1ノート1アイデアの原則

**英語表記**: Note Autonomy

---

### 出典タグ

**定義**: Literature Noteに付与する、参照元文献の情報をタグ形式で表現したメタデータ。

**説明**: `@author:著者名`, `@title:タイトル`, `@url:URL`, `@page:ページ番号` 等の形式。Literature Noteのメインコンテンツ（自分の言葉のメモ）とは区別して管理される。

**使用例**:
```
@author:Ahrens
@title:How to Take Smart Notes
@page:85
```

**関連用語**: Literature Note, SourceTag

**英語表記**: Source Tag

---

## 技術用語

### Electron

**定義**: ChromiumとNode.jsをベースにしたクロスプラットフォームデスクトップアプリフレームワーク。

**公式サイト**: https://www.electronjs.org/

**本プロジェクトでの用途**: Zettelkastenerのデスクトップアプリ基盤。グローバルショートカット登録・ネイティブメニュー・ファイルアクセスを担当。

**バージョン**: 最新安定版

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### SQLite

**定義**: サーバーレスの組み込みリレーショナルデータベースエンジン。

**公式サイト**: https://sqlite.org/

**本プロジェクトでの用途**: ノート・リンク・出典タグのローカル永続化。FTS5（全文検索）も使用。

**バージョン**: better-sqlite3 経由で使用

**関連ドキュメント**: [docs/functional-design.md](functional-design.md)

---

### IPC（Inter-Process Communication）

**定義**: Electronにおいて、Main Process と Renderer Process の間でデータをやり取りする仕組み。

**本プロジェクトでの用途**: UIからのノート作成・検索等のリクエストをMain Process（Service層）に橋渡しする。`contextBridge` + `ipcRenderer` / `ipcMain` を使用。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/repository-structure.md](repository-structure.md)

---

### FTS5

**定義**: SQLiteの全文検索拡張モジュール（Full-Text Search version 5）。

**本プロジェクトでの用途**: ノートのタイトルと本文を横断検索する機能の実装。

**設定例**:
```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title,
  content,
  content=notes,
  content_rowid=rowid
);
```

---

### PWA（Progressive Web App）

**定義**: Webブラウザ上で動作しながらネイティブアプリに近い体験を提供する技術仕様の総称。

**公式サイト**: https://web.dev/progressive-web-apps/

**本プロジェクトでの用途**: 機能8（スマホ対応）の実装手段。外出先でFleeting Noteを素早く入力するためのスマホ向け軽量UI。MVP段階では「後回し（P1）」として扱い、Renderer側のReactコンポーネントを流用して構築予定。

**関連ドキュメント**: [docs/product-requirements.md](product-requirements.md), [docs/architecture.md](architecture.md)

**英語表記**: Progressive Web App (PWA)

---

### CodeMirror

**定義**: Webブラウザ上で動作するリッチテキストエディターコンポーネントライブラリ。

**公式サイト**: https://codemirror.net/

**本プロジェクトでの用途**: ZettelkastenerのMarkdownエディター基盤。Extensionで`[[`トリガーのリンクサジェスト機能を実装。

**バージョン**: 6.x

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### better-sqlite3

**定義**: Node.js向けの同期型SQLiteクライアントライブラリ。

**公式サイト**: https://github.com/WiseLibs/better-sqlite3

**本プロジェクトでの用途**: Electron Main ProcessからSQLiteにアクセスするために使用。同期 APIによる高速なローカルDB操作が可能。

**選定理由**: 非同期ラッパー不要・高速・ Electronとの相性が良い。

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### Zustand

**定義**: React向けの軽量状態管理ライブラリ。

**公式サイト**: https://zustand-demo.pmnd.rs/

**本プロジェクトでの用途**: Renderer Processの状態管理。`useNoteStore`（ノート一覧・選択状態）・`useLinkStore`（リンク・バックリンク）・`useUIStore`（モーダル・トースト・ローディング）を管理。

**バージョン**: 4.x

**選定理由**: 軽量・TypeScript親和性が高い・ボイラープレートが少ない。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/repository-structure.md](repository-structure.md)

---

### D3.js

**定義**: SVG・ Canvasを使ったデータ可視化ライブラリ。

**公式サイト**: https://d3js.org/

**本プロジェクトでの用途**: Permanent Note間のリンクをノードとエッジで描画するリンクグラフ局面の実装。force simulationでノード配置を自動調整。

**バージョン**: 7.x

**選定理由**: 柔軟なノード/エッジ描画が可能・カスタマイズ性が高い。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/functional-design.md](functional-design.md)

---

### Vite

**定義**: 高速HMR（Hot Module Replacement）を特徴とするモダンフロントエンドビルドツール。

**公式サイト**: https://vitejs.dev/

**本プロジェクトでの用途**: Renderer Process（React）のバンドルと開発サーバー。`vite.config.ts`で設定する。

**バージョン**: 5.x

**選定理由**: 高速HMR・Electron対応・ TypeScriptネイティブサポート。

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### Vitest

**定義**: Viteと高い親和性を持つ高速なテストフレームワーク。

**公式サイト**: https://vitest.dev/

**本プロジェクトでの用途**: Service / Repository / Renderer Component のユニットテストと一部統合テストを実行する。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/development-guidelines.md](development-guidelines.md)

---

### ESLint

**定義**: JavaScript / TypeScript コードの静的解析を行うリンター。

**公式サイト**: https://eslint.org/

**本プロジェクトでの用途**: TypeScript / React コードの規約違反や潜在バグをコミット前に検出する。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/development-guidelines.md](development-guidelines.md)

---

### Prettier

**定義**: コードフォーマットを自動整形するフォーマッター。

**公式サイト**: https://prettier.io/

**本プロジェクトでの用途**: TypeScript / TSX / 設定ファイルの表記ゆれを防ぎ、保存時・コミット時に整形を行う。

**関連ドキュメント**: [docs/architecture.md](architecture.md), [docs/development-guidelines.md](development-guidelines.md)

---

### husky

**定義**: Git hooks をプロジェクト内で管理するためのツール。

**公式サイト**: https://typicode.github.io/husky/

**本プロジェクトでの用途**: pre-commit フックで `lint-staged` を起動し、ESLint / Prettier を自動実行する。

**関連ドキュメント**: [docs/development-guidelines.md](development-guidelines.md)

---

### lint-staged

**定義**: Git のステージ済みファイルに対してのみコマンドを実行する補助ツール。

**公式サイト**: https://github.com/lint-staged/lint-staged

**本プロジェクトでの用途**: pre-commit 時に変更された TypeScript / TSX ファイルだけへ ESLint / Prettier を適用する。

**関連ドキュメント**: [docs/development-guidelines.md](development-guidelines.md)

---

### electron-store

**定義**: Electronアプリ向けの設定永続化ライブラリ。

**公式サイト**: https://github.com/sindresorhus/electron-store

**本プロジェクトでの用途**: アプリ設定（ショートカットキー・ウィンドウ位置等）を`config.json`に永続化するために使用。JSON形式で扱いやすく、設定の読み書きをシンプルに保てる。

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### DOMPurify

**定義**: HTMLコンテンツのサニタイズを行いXSS攻撃を防ぐJavaScriptライブラリ。

**公式サイト**: https://github.com/cure53/DOMPurify

**本プロジェクトでの用途**: MarkdownのHTMLレンダリング時にXSS対策としてHTMLをサニタイズするために使用。

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

### OverflowError

**定義**: Folgezettel IDの採番時、同一親配下のサブノード数が上限（26件または9件）を超過した場合にスローされるエラー。

**エラーコード**: `OVERFLOW_ERROR`

**発生条件**:
- アルファベット期待の位置で `z` を超過した場合
- 数字期待の位置で `9` を超過した場合

**ユーザー対応**: ユーザーに手動での再配置を促す

**関連ドキュメント**: [docs/functional-design.md](functional-design.md), [docs/architecture.md](architecture.md), [docs/development-guidelines.md](development-guidelines.md)

---

## UI機能用語

### クイックキャプチャ

**定義**: アイデアが浮かんだ瞬間にグローバルショートカット一発でメモ入力モードを起動する機能。

**本プロジェクトでの用途**: Fleeting Note作成の摩擦をゼロに近づけるための中核機能。`Cmd/Ctrl+Shift+N`（デフォルト）で起動。

**関連用語**: Fleeting Note, グローバルショートカット

**展開**: [docs/product-requirements.md](product-requirements.md)

**英語表記**: Quick Capture

---

### 分割フロー

**定義**: 1つのノートに複数のアイデアが含まれていることが判明した際に、選択範囲を新しいノートとして切り出すUI機能。

**本プロジェクトでの用途**: 1ノート1アイデアの原則を守るための補助機能。Permanent Note保存時に起動可能。

**展開内容**:
1. 選択範囲の内容を新しいノートにコピー
2. 元のノートから選択範囲を削除
3. 元のノートと新しいノート間に自動でリンクを作成

**関連用語**: 1ノート1アイデアの原則, Permanent Note

**英語表記**: Split Flow

---

### レビューフロー

**定義**: 作成済みのFleeting Notesを定期的にレビューし、Literature NoteまたはPermanent Noteへ昇格するか削除するかを判断するUI機能。

**本プロジェクトでの用途**: Fleeting Notesが溜まり続けることを防いで、Zettelkastenの「キャプチャと整理の分離」を実現する。

**引き金になる情報**: 7日以上未処理のFleeting Noteにはバッジ・警告を表示する。

**関連用語**: Fleeting Note, Literature Note, Permanent Note

**展開**: [docs/functional-design.md](functional-design.md)

**英語表記**: Review Flow

---

### 双方向リンク（バックリンク）

**定義**: ノートAがノートBにリンクを張った場合、ノートBからもノートAを参照できる機能。

**本プロジェクトでの用途**: リンクテーブルの逆方向クエリで実現。知識ネットワークの探索性を高める。

**実装**: `LinkService.getLinks(noteId)` が `{ outgoing, incoming }` の両方を返す。

**関連用語**: リンク, Permanent Note, リンクグラフ

**英語表記**: Bidirectional Link / Backlink

---

### ドラフト

**定義**: DBに保存される前の編集中ノートの一時保存データ。

**本プロジェクトでの用途**: localStorageに30秒ごとに保存される。アプリがクラッシュした場合でも書きかけのノートを復元できる。

**展開**: [docs/functional-design.md](functional-design.md)

**英語表記**: Draft

---

## 略語・頭字語

### MoC

**正式名称**: Map of Content

**意味**: 索引ノート・構造ノートの現代的な呼称。

**本プロジェクトでの使用**: 索引ノート種別の内部・外部名称として使用。

---

### PRD

**正式名称**: Product Requirements Document

**意味**: プロダクト要求定義書。

**本プロジェクトでの使用**: [docs/product-requirements.md](product-requirements.md)

---

### MVP

**正式名称**: Minimum Viable Product

**意味**: 最小限の機能を持つ実用的なプロダクト。

**本プロジェクトでの使用**: P0機能（即時入力・種別強制・リンク管理・Folgezettel・出典タグ）のみ実装した最初のリリース。

---

## アーキテクチャ用語

### レイヤードアーキテクチャ

**定義**: UIレイヤー・Serviceレイヤー・Repositoryレイヤー・DBの4層に責務を分離するアーキテクチャパターン。

**本プロジェクトでの適用**: Main Process内をIPC Handlers → Service → Repository → SQLite の順に分離。上位レイヤーから下位レイヤーへのみ依存を許可。

**図解**:
```
IPC Handlers（Rendererからの要求受付）
    ↓
Service層（ビジネスロジック）
    ↓
Repository層（DB操作の抽象化）
    ↓
SQLite
```

**関連コンポーネント**: NoteService, NoteRepository, NoteHandlers

---

### バリデーション

**定義**: ノートを保存する前にビジネスルール（種別ごとの制約）を検証すること。

**本プロジェクトでの適用**:
- Permanent Note: リンク最低1件必須・タイトル必須
- Literature Note: 出典タグ最低1件必須
- Fleeting Note: 制約なし

**関連コンポーネント**: NoteService.validate(), ValidationError

---

### ReviewService

**定義**: Fleeting Noteのレビューキュー取得・変換・削除を担う Serviceレイヤーのクラス。

**本プロジェクトでの用途**: レビューフローのバックエンドロジックを実装。未処理・期限超過（7日超）のFleeting Noteの一覧取得、Permanent/Literature Noteへの変換、削除を担当する。

**主要メソッド**: `getReviewQueue()`, `getStaleNotes(days)`, `convertAndDelete()`, `deleteAsFleeting()`

**関連ドキュメント**: [docs/functional-design.md](functional-design.md)

---

### electron-builder

**定義**: Electronアプリをプラットフォーム向け配布物（dmg / AppImage 等）にパッケージングするツール。

**公式サイト**: https://www.electron.build/

**本プロジェクトでの用途**: `npm run dist` 実行時にmacOS（dmg）/ Linux（AppImage）向けバイナリを生成する。設定は `electron-builder.config.js` に記述。

**バージョン**: 最新安定版

**関連ドキュメント**: [docs/architecture.md](architecture.md)

---

## 索引

### アルファベット順

- [better-sqlite3](#better-sqlite3)
- [CodeMirror](#codemirror)
- [D3.js](#d3js)
- [DOMPurify](#dompurify)
- [Electron](#electron)
- [electron-builder](#electron-builder)
- [electron-store](#electron-store)
- [ESLint](#eslint)
- [Fleeting Note](#fleeting-note)
- [Folgezettel](#folgezettel)
- [FTS5](#fts5)
- [husky](#husky)
- [IPC (Inter-Process Communication)](#ipcinter-process-communication)
- [lint-staged](#lint-staged)
- [Literature Note](#literature-note)
- [Luhmann式ID](#luhmann式id)
- [MoC](#moc)
- [MVP](#mvp)
- [OverflowError](#overflowerror)
- [Permanent Note](#permanent-note)
- [Prettier](#prettier)
- [PRD](#prd)
- [PWA（Progressive Web App）](#pwaProgressive-web-app)
- [ReviewService](#reviewservice)
- [SQLite](#sqlite)
- [Vitest](#vitest)
- [Vite](#vite)
- [Zettelkasten](#zettelkasten)
- [Zustand](#zustand)

### 日本語50音順

- [クイックキャプチャ](#クイックキャプチャ)
- [ノートの自律性](#ノートの自律性)
- [ドラフト](#ドラフト)
- [双方向リンク](#双方向リンクバックリンク)
- [出典タグ](#出典タグ)
- [索引ノート](#索引ノートmap-of-content--moc)
- [バリデーション](#バリデーション)
- [分割フロー](#分割フロー)
- [レイヤードアーキテクチャ](#レイヤードアーキテクチャ)
- [レビューフロー](#レビューフロー)
- [1ノート1アイデアの原則](#1ノート1アイデアの原則)

### カテゴリ横断参照

#### ノート種別関連
- [Fleeting Note](#fleeting-note)
- [Literature Note](#literature-note)
- [Permanent Note](#permanent-note)
- [索引ノート](#索引ノートmap-of-content--moc)

#### UI機能関連
- [クイックキャプチャ](#クイックキャプチャ)
- [分割フロー](#分割フロー)
- [レビューフロー](#レビューフロー)
- [ドラフト](#ドラフト)

#### 技術スタック関連
- [Electron](#electron)
- [electron-builder](#electron-builder)
- [electron-store](#electron-store)
- [ReviewService](#reviewservice)
- [SQLite](#sqlite)
- [better-sqlite3](#better-sqlite3)
- [CodeMirror](#codemirror)
- [D3.js](#d3js)
- [DOMPurify](#dompurify)
- [ESLint](#eslint)
- [FTS5](#fts5)
- [husky](#husky)
- [IPC](#ipcinter-process-communication)
- [lint-staged](#lint-staged)
- [OverflowError](#overflowerror)
- [Prettier](#prettier)
- [PWA](#pwaProgressive-web-app)
- [Vitest](#vitest)
- [Vite](#vite)
- [Zustand](#zustand)

#### Zettelkasten方法論関連
- [Zettelkasten](#zettelkasten)
- [Folgezettel](#folgezettel)
- [Luhmann式ID](#luhmann式id)
- [1ノート1アイデアの原則](#1ノート1アイデアの原則)
- [ノートの自律性](#ノートの自律性)
- [出典タグ](#出典タグ)
