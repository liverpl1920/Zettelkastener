# 要求内容

## 概要

レビューで指摘された6つの永続ドキュメントの不整合、誤記、重複、および不足情報を修正し、ドキュメント群全体の一貫性を高める。

## 背景

`docs/` 配下の正式ドキュメントは、実装前提となる永続ドキュメントである。レビュー結果では、誤字・誤記、同一内容の重複記載、優先度表現の揺れ、React実装規約やリリース計画などの不足が確認された。これらを解消し、実装フェーズで参照しやすい single source of truth を整備する必要がある。

## 実装対象の機能

### 1. レビュー指摘事項の反映
- 誤字・誤記・不自然な表現を修正する
- ドキュメント間の矛盾と重複を解消する

### 2. 不足情報の補完
- リリースマイルストーン、Reactコンポーネント規約、想定スクリプト一覧などを追加する
- リポジトリ構造と用語集に不足していた項目を追記する

## 受け入れ条件

### レビュー指摘事項の反映
- [ ] `functional-design.md` の誤字と `folgezettelId` の説明矛盾が解消されている
- [ ] `product-requirements.md` と `architecture.md` のパフォーマンス記述重複が整理されている
- [ ] Folgezettel採番アルゴリズムの詳細が1箇所に集約されている

### 不足情報の補完
- [ ] `development-guidelines.md` に React コンポーネント規約と想定スクリプト一覧が追加されている
- [ ] `glossary.md` に誤記修正と開発ツール用語追加が反映されている
- [ ] `repository-structure.md` に workflow ファイル例と Folgezettel 関連UI例が追記されている

## 成功指標

- レビューで指摘された高優先度・中優先度事項がすべて反映されている
- 6つの永続ドキュメント間で、責務の重複と表現の揺れが解消されている

## スコープ外

以下はこのフェーズでは実装しません:

- 新しい機能コードの実装
- `docs/idea/` 配下の非正式ドキュメントの改訂

## 参照ドキュメント

- `docs/product-requirements.md` - プロダクト要求定義書
- `docs/functional-design.md` - 機能設計書
- `docs/architecture.md` - 技術仕様書
- `docs/repository-structure.md` - リポジトリ構造定義書
- `docs/development-guidelines.md` - 開発ガイドライン
- `docs/glossary.md` - 用語集