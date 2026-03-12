# タスクリスト: Fleeting Note レビューフロー（STEP2）

## フェーズ1: 型定義・共有層

- [x] `shared/types.ts` に `SourceTag` と `PromoteInput` を追加する
- [x] `shared/window.d.ts` に `notes.delete` と `notes.promote` の型宣言を追加する

## フェーズ2: Repository層

- [x] `NoteRepository.ts` に `update()` を実装する（type / content / title / processed_at）
- [x] `NoteRepository.ts` に `insertSourceTag()` を実装する
- [x] `NoteRepository.ts` に `linkNoteToSourceTag()` を実装する
- [x] `NoteRepository.ts` に `findSourceTagsByNoteId()` を実装する
- [x] `rowToNote()` を修正してDBからsourceTagIdsを取得するようにする

## フェーズ3: Service層

- [x] `NoteService.ts` に `delete()` を実装する
- [x] `NoteService.ts` に `promote()` を実装する（Literature / Permanent 変換）

## フェーズ4: IPC層

- [x] `NoteHandlers.ts` に `note:delete` ハンドラーを追加する
- [x] `NoteHandlers.ts` に `note:promote` ハンドラーを追加する

## フェーズ5: Preload層

- [x] `preload/index.ts` に `notes.delete()` を追加する
- [x] `preload/index.ts` に `notes.promote()` を追加する

## フェーズ6: Frontend

- [x] `useNoteStore.ts` に `removeNote()` アクションを追加する
- [x] `FleetingNoteItem` にアクションボタン（削除・変換）を追加する
- [x] `ConvertNoteModal.tsx` を新規作成する（変換ダイアログ）
- [x] `App.tsx` でモーダル表示用の状態管理を追加する（必要があれば）

## フェーズ7: テスト

- [x] `NoteService.test.ts` に `delete()` のテストを追加する
- [x] `NoteService.test.ts` に `promote()` Literature変換のテストを追加する
- [x] `NoteService.test.ts` に `promote()` Permanent変換のテストを追加する
- [x] `note-crud.test.ts` に delete / promote の統合テストを追加する

## 実装後の振り返り

### 実装完了日
2026-03-11

### 完了タスクサマリー
全16タスク（フェーズ1〜7）完了。テスト35件全パス、Lint・TypeCheckもエラーなし。

### 計画と実績の差分

| 項目 | 計画 | 実績 |
|------|------|------|
| Permanent Note変換 | リンク入力UI省略・警告表示 | 計画通り実装。フォーム内に注釈メッセージで周知 |
| rowToNote修正 | 独立メソッド化 | `private fetchSourceTagIds()` ヘルパーを追加し、各返却メソッドで呼び出す形で実装 |
| FleetingNoteList置換 | 全体書き換え | replace_string_in_fileの制約で旧コードが末尾に残り、追加手動削除が必要だった |

### 学んだこと

- `replace_string_in_file` でファイル全体を置き換える場合は、旧コード全文を `oldString` に含める必要がある
- `better-sqlite3` の `INSERT OR IGNORE` を利用して出典タグの重複防止を効率良く実装できた
- Vitestのモックに新しいリポジトリメソッドを追加するのを忘れると「is not a function」エラーになる（今回は最初から対応）

### 次回への改善提案（後続 Step3 の範囲）

1. **Folgezettel ID 採番** — Permanent Note 変換時に `FolgezettelService.assignId()` を実装して付与する
2. **[[リンク]]サジェスト** — Permanent Note 変換モーダルにリンク入力UI（`[[` 入力でサジェスト）を追加する
3. **変換後の Literature Note 一覧表示** — メイン画面に Literature Note タブを追加する
4. **変換済みノートの除外** — `processed_at` が non-null の Fleeting Note の表示制御を追加する

