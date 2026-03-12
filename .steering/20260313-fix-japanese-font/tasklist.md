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

- [ ] システムに `fonts-noto-cjk` をインストールする
  - [ ] `sudo apt-get install -y fonts-noto-cjk` を実行
  - [ ] `fc-list :lang=ja` で日本語フォントが表示されることを確認

## フェーズ2: devcontainer.json の修正

- [ ] `postCreateCommand` に日本語フォントインストールを追加する
  - [ ] `.devcontainer/devcontainer.json` の `postCreateCommand` を修正

## フェーズ3: CSS フォントスタックの改善

- [ ] `App.tsx` の `fontFamily` に日本語フォントを追加する
  - [ ] `styles.container.fontFamily` を修正

- [ ] `QuickCaptureForm.tsx` の `fontFamily` に日本語フォントを追加する
  - [ ] `styles.container.fontFamily` を修正

## フェーズ4: 品質チェックと修正

- [ ] すべてのテストが通ることを確認
  - [ ] `npm test`
- [ ] リントエラーがないことを確認
  - [ ] `npm run lint`
- [ ] 型エラーがないことを確認
  - [ ] `npm run typecheck`
- [ ] ビルドが成功することを確認
  - [ ] `npm run build`

## フェーズ5: ドキュメント更新

- [ ] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
{YYYY-MM-DD}

### 計画と実績の差分

**計画と異なった点**:
- {計画時には想定していなかった技術的な変更点}

### 学んだこと
- {学んだこと}

### 次回への改善提案
- {改善提案}
