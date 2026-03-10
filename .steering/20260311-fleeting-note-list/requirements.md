# 要求内容

## 概要

メイン画面に Fleeting Note の一覧を表示し、保存したメモを確認できるようにする。

## 背景

Feature 1（クイックキャプチャ）でFleeting Noteを保存できるようになったが、保存後に内容を確認する手段がない。「後で見返す」という Zettelkasten の基本フローが成立していない。

## 実装対象の機能

### 1. Fleeting Note 一覧表示

- メイン画面でFleeting Noteをリスト表示する
- 各ノートの作成日時・内容（先頭100文字）を表示する
- 新しい順（createdAt降順）でソートする
- ノートが存在しない場合はメッセージを表示する

### 2. `note:getByType` IPC ルート追加

- Renderer から種別を指定してノートを取得できる IPC を追加する
- 既存の `NoteRepository.findByType()` を活用する

## 受け入れ条件

### Fleeting Note 一覧表示

- [ ] アプリ起動時にFleeting Noteが一覧表示される
- [ ] 各ノートに作成日時と内容プレビュー（先頭100文字）が表示される
- [ ] ノートが存在しない場合は「まだFleeting Noteがありません」と表示される
- [ ] Ctrl+Shift+N で保存後、一覧に反映される（再取得される）

### IPC

- [ ] `note:getByType` チャンネルが登録されている
- [ ] preload 経由で `window.api.notes.getByType` が呼び出せる

## スコープ外

- Fleeting Note の削除UI
- Literary / Permanent への変換UI
- ノートのクリックで詳細表示
- ページネーション

## 参照ドキュメント

- `docs/product-requirements.md` - 機能1・機能2
- `docs/architecture.md` - IPC/Renderer レイヤー構成
