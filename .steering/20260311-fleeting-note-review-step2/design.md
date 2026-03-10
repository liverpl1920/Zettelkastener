# 設計: Fleeting Note レビューフロー（STEP2）

## 全体アーキテクチャ変更点

既存のレイヤードアーキテクチャ（IPC → Service → Repository）を踏襲して拡張する。

## 1. Repository層の変更

### NoteRepository に追加するメソッド

```typescript
// ノードを更新する（type / content / title / processed_at）
update(id: string, fields: UpdateNoteFields): Note

// 出典タグを挿入する
insertSourceTag(key: string, value: string): SourceTag

// ノートと出典タグを紐付ける
linkNoteToSourceTag(noteId: string, sourceTagId: string): void

// ノートに紐付く出典タグを全件取得する
findSourceTagsByNoteId(noteId: string): SourceTag[]
```

### `rowToNote` の修正

- 現在 `sourceTagIds: []` とハードコードされているため、DBから取得するよう修正する

## 2. Service層の変更

### NoteService に追加するメソッド

```typescript
// ノートを削除する（Fleeting Note のみ対象）
delete(id: string): void

// Fleeting → Literature / Permanent に昇格する
promote(
  fleetingId: string,
  targetType: 'literature' | 'permanent',
  input: PromoteInput
): Note
```

`PromoteInput`:
```typescript
export interface PromoteInput {
  content?: string;       // 書き直し後の本文（省略時は元の本文を引き継ぐ）
  title?: string;         // 新しいタイトル（省略時は元のタイトルを引き継ぐ）
  sourceTagTexts?: string[]; // Literature Note 用 "@key:value" 形式の文字列配列
  parentFolgezettelId?: string | null; // Permanent Note 用（現時点では使用せず null 固定）
}
```

### promote() のロジック

1. `fleetingId` でFleeting Noteを取得（存在しない場合はNoteNotFoundError）
2. `targetType === 'literature'` の場合:
   - `sourceTagTexts` を解析して `source_tags` テーブルに挿入
   - `note_source_tags` 中間テーブルに紐付け
   - `notes.type` を `'literature'` に更新
   - `notes.processed_at` に現在時刻を記録
3. `targetType === 'permanent'` の場合:
   - `notes.type` を `'permanent'` に更新
   - `folgezettel_id` は null のまま（後続Step3で採番予定）
   - `notes.processed_at` に現在時刻を記録
4. 更新後のノートを返す

### sourceTagText のパース仕様

```
"@author:Ahrens"  → { key: "author", value: "Ahrens" }
"@title:How to Take Smart Notes" → { key: "title", value: "How to Take Smart Notes" }
"@url:https://example.com" → { key: "url", value: "https://example.com" }
```

不正なフォーマット（`@key:` なし）はスキップする。

## 3. IPC層の変更

### 追加ハンドラー

```
note:delete   — ノート削除 (noteId)
note:promote  — Fleeting昇格 (fleetingId, targetType, promoteInput)
```

### preload / window.d.ts

```typescript
notes.delete(id: string): Promise<IPCResult<void>>
notes.promote(fleetingId: string, targetType: 'literature' | 'permanent', input: PromoteInput): Promise<IPCResult<Note>>
```

## 4. Frontend（Renderer）の変更

### useNoteStore の変更

- `removeNote(id: string)` アクションを追加する

### FleetingNoteList / FleetingNoteItem の変更

- 各アイテムに「削除」「→ Literature」「→ Permanent」ボタンを追加する
- クリックで `ConvertNoteModal` を開く

### ConvertNoteModal（新規コンポーネント）

- 変換先種別（literature / permanent）を受け取る
- 本文を書き直すテキストエリア
- Literature Note の場合: 出典タグ入力欄（テキスト、改行区切りで複数入力可）
- 「変換」「キャンセル」ボタン
- 変換成功後: ストアから元ノートを削除・新ノートを追加

## 5. 型定義の変更

`shared/types.ts` に `PromoteInput` と `SourceTag` を追加する。

## UIデザイン方針

- 既存のダークテーマ（#1a1b26, #313244, #cdd6f4）に統一する
- モーダルはオーバーレイで表示（シンプルな実装）
- エラーはモーダル内インラインで表示
