# 設計書

## アーキテクチャ概要

既存のレイヤードアーキテクチャに沿って最小変更で実装する。

```
Renderer (FleetingNoteList)
    ↓ window.api.notes.getByType('fleeting')
Preload (contextBridge)
    ↓ ipcRenderer.invoke('note:getByType', ...)
NoteHandlers (note:getByType)
    ↓
NoteService.getByType()
    ↓
NoteRepository.findByType()  ← 既存メソッド
    ↓
SQLite
```

## コンポーネント設計

### 1. NoteService.getByType() [Main]

**責務**: 種別でノート一覧を取得する

**実装の要点**:
- 既存の `NoteRepository.findByType()` をラップするだけ
- createdAt 降順ソートは Repository 側で SQL ORDER BY で行う

### 2. note:getByType IPC ハンドラー [Main]

**責務**: Renderer からの種別指定取得リクエストを処理する

**実装の要点**:
- `ipcMain.handle('note:getByType', ...)` として登録
- 引数: `{ type: NoteType }`
- 返値: `IPCResult<Note[]>`

### 3. window.api.notes.getByType [Preload]

**責務**: Renderer が安全に呼び出せるブリッジ関数

**実装の要点**:
- `contextBridge` 経由で公開
- `window.d.ts` の型定義も更新

### 4. FleetingNoteList.tsx [Renderer]

**責務**: Fleeting Noteの一覧を表示するReactコンポーネント

**実装の要点**:
- `useEffect` でマウント時に `window.api.notes.getByType('fleeting')` を呼ぶ
- Zustand の `useNoteStore` に取得結果を反映する
- ノートは `createdAt` 降順で表示（API から返ってきた順）
- 内容は先頭100文字をプレビューとして表示
- 空の場合は「まだFleeting Noteがありません」を表示
- クイックキャプチャ保存後に再取得するため、`ipcRenderer` の `on` ではなく polling の代わりに `useNoteStore` 経由で更新

### 5. App.tsx 更新 [Renderer]

**責務**: メイン画面に FleetingNoteList を組み込む

## データフロー

### アプリ起動時の一覧取得
```
1. App.tsx レンダリング（mode !== 'capture'）
2. FleetingNoteList マウント
3. useEffect → window.api.notes.getByType('fleeting')
4. IPC → NoteService.getByType('fleeting')
5. NoteRepository.findByType('fleeting') → Note[]
6. IPCResult<Note[]> → Renderer
7. useNoteStore.upsertNote で正規化ストアへ
8. UI レンダリング
```

### クイックキャプチャ保存後の反映
```
1. QuickCaptureForm で保存完了
2. useNoteStore.upsertNote(newNote) （既存動作）
3. App.tsx の FleetingNoteList が useNoteStore を購読しているため自動更新
```

## テスト戦略

### ユニットテスト
- `NoteService.getByType('fleeting')` が正しくノート一覧を返すこと

### 統合テスト
- 既存 `note-crud.test.ts` に `findByType` のテストが含まれているためカバー済み
