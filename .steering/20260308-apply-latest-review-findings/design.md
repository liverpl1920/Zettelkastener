# 設計書

## アーキテクチャ概要

今回の作業はアプリケーションコードではなく、永続ドキュメント群の情報追補を行う。既存のドキュメント文体・表記ルールを維持しながら最小差分で追記する。

```text
repository-structure.md
  └─ プロジェクト構造図に .steering/ を追記する

glossary.md
  └─ 技術用語セクションに ReviewService / electron-builder / Vitest を追加
  └─ 末尾に五十音 / アルファベット索引セクションを追加

functional-design.md
  └─ Note エンティティの制約リストに type === 'index' の folgezettelId 方針を追記

product-requirements.md
  └─ 機能8（スマホPWA）の受け入れ条件に対象ブラウザを追記
```

## 修正方針

### single source of truth の維持

- 既存ドキュメントの責務分担を変えない
- 追記は既存セクションに自然に馴染む粒度に留める

### 各修正の詳細方針

#### `repository-structure.md`

プロジェクト構造図の `.github/` ブロック付近に `.steering/` を挿入する。`.github/copilot-instructions.md` での言及と整合するように記述する。

#### `glossary.md` — 技術用語追加

既存の技術用語エントリのスタイル（定義・本プロジェクトでの用途・バージョン・関連ドキュメント）に揃えて追記する。

#### `glossary.md` — 索引追加

ドキュメント末尾に「索引」セクションを追加する。五十音順（Zettelkastenドメイン用語）とアルファベット順（技術用語）の2節に分けてリスト化する。

#### `functional-design.md`

Note エンティティの制約箇条書きに、`type === 'index'` の場合の `folgezettelId` に関する1行を追加する。

#### `product-requirements.md`

機能8の受け入れ条件リストに、対象ブラウザ条件を1行追加する。

## エラーハンドリング

今回の作業では新たなエラークラスは追加しない。

## テスト戦略

- 対象外（ドキュメント修正のみ）
- 検証: 修正後に差分レビューし、指摘5件が反映済みであることを確認する
