# 要求内容

## 概要

最新のドキュメントレビュー（2026-03-08実施）で新たに検出された指摘事項を修正し、ドキュメント群の完全性と一貫性をさらに高める。

## 背景

直前のドキュメントレビューで、以下の未解消の指摘が新たに確認された。前回の `20260308-fix-doc-review-findings` では解消されなかった内容であり、今回のステアリングで対応する。

## 実装対象の改善事項

### [推奨] 優先度: 高

1. **`repository-structure.md`**: プロジェクト構造図に `.steering/` ディレクトリが記載されていない
2. **`glossary.md`**: 主要な技術コンポーネント（`ReviewService`・`electron-builder`・`Vitest`）が未収録
3. **`functional-design.md`**: `type === 'index'` の `folgezettelId` 採番方針が未記述

### [提案] 優先度: 低

4. **`product-requirements.md`**: 機能8（スマホPWA）の受け入れ条件に対象ブラウザが未記載
5. **`glossary.md`**: 用語数増加に備えた五十音/アルファベット索引が未整備

## 受け入れ条件

- [ ] `repository-structure.md` の構造図に `.steering/` が記載されている
- [ ] `glossary.md` に `ReviewService`・`electron-builder`・`Vitest` が追加されている
- [ ] `functional-design.md` の `Note` 制約セクションに `type === 'index'` の `folgezettelId` 方針が明記されている
- [ ] `product-requirements.md` の機能8に対象ブラウザが追記されている
- [ ] `glossary.md` に五十音/アルファベット索引セクションが追加されている

## 成功指標

- 今回のレビューで指摘された5件すべてが反映されている
- 追加内容が既存記述と矛盾しない

## スコープ外

- 新しい機能コードの実装
- 前回ステアリング（`20260308-fix-doc-review-findings`）で修正済みの内容の再修正
- `docs/idea/` 配下の非正式ドキュメントの改訂

## 参照ドキュメント

- `docs/repository-structure.md` - リポジトリ構造定義書
- `docs/glossary.md` - 用語集
- `docs/functional-design.md` - 機能設計書
- `docs/product-requirements.md` - プロダクト要求定義書
