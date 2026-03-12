# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 「実装が複雑すぎるため後回し」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ1: 日本語フォントのインストール

- [x] システムに `fonts-noto-cjk` をインストールする
  - [x] `sudo apt-get install -y fonts-noto-cjk` を実行
  - [x] `fc-list :lang=ja` で日本語フォントが表示されることを確認

## フェーズ2: devcontainer.json の修正

- [x] `postCreateCommand` に日本語フォントインストールを追加する
  - [x] `.devcontainer/devcontainer.json` の `postCreateCommand` を修正

## フェーズ3: CSS フォントスタックの改善

- [x] `App.tsx` の `fontFamily` に日本語フォントを追加する
  - [x] `styles.container.fontFamily` を修正

- [x] `QuickCaptureForm.tsx` の `fontFamily` に日本語フォントを追加する
  - [x] `styles.container.fontFamily` を修正

## フェーズ4: 品質チェックと修正

- [x] すべてのテストが通ることを確認
  - [x] `npm test`
- [x] リントエラーがないことを確認
  - [x] `npm run lint`
- [x] 型エラーがないことを確認
  - [x] `npm run typecheck`
- [x] ビルドが成功することを確認
  - [x] `npm run build`

## フェーズ5: ドキュメント更新

- [x] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
2026-03-13

### 計画と実績の差分

**計画と異なった点**:
- 特になし。計画通りに3箇所（devcontainer.json、App.tsx、QuickCaptureForm.tsx）の修正で対応完了。

### 学んだこと
- Ubuntu 24.04 の devcontainer イメージには日本語フォントが含まれておらず、`postCreateCommand` でのインストールが必要。
- CSS の `system-ui` はラテン文字専用フォントに解決されるため、CJK アプリでは明示的なフォール指定が必須。
- `fonts-noto-cjk` パッケージで Noto Sans CJK JP / Noto Serif CJK JP が両方インストールされる。

### 次回への改善提案
- devcontainer のベースイメージを日本語フォント入りのものに変更することで `postCreateCommand` の肥大化を防げる。
- フォントファミリー定数を共通ファイル（例: `src/renderer/theme.ts`）で一元管理することで、各コンポーネントへの個別指定を減らせる。
