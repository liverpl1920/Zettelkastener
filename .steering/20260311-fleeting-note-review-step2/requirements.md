# 要求定義: Fleeting Note レビューフロー（STEP2）

## 概要

READMEに記載の「Step 2」を実装する。メイン画面上でFleeting Noteを一覧表示し、
以下の3つのアクションを提供する:

1. **削除** — 不要なメモをそのまま削除する
2. **Literature Noteへ変換** — 出典タグ（@author:等）を付けて変換する
3. **Permanent Noteへ変換** — 本文を書き直してPermanent Noteとして保存する

## ユーザーストーリー

- ユーザーとして、Fleeting Noteをクリックして選択し、詳細を確認できる
- ユーザーとして、不要なFleeting Noteを削除できる
- ユーザーとして、文献から着想を得たFleeting Noteを出典タグを付けてLiterature Noteに変換できる
- ユーザーとして、定着させたい知識のFleeting NoteをPermanent Noteに変換できる
- ユーザーとして、変換時に本文を書き直すことができる

## 制約

- Literature Noteへの変換には出典タグが最低1件必要 (バリデーション強制)
- Permanent Noteへの変換にはリンクが最低1件必要 (バリデーション強制)
  → MVP: UIにリンク入力フォームは省略し、変換時に警告を表示する
- 変換後、元のFleeting Noteは削除される（processed_atを記録）

## スコープ除外（後続フェーズ）

- Permanent Note変換時のFolgezettel ID採番（後続Step3で実装予定）
- [[リンク]]サジェスト機能（後続Step3で実装予定）
- Permanent Noteへのリンク付与UI（後続Step3で実装予定）
- Index (MoC)の作成（後続フェーズ）
