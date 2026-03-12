# 設計書

## アーキテクチャ概要

フォント問題はインフラ層（OS フォント）と UI 層（CSS フォント指定）の2箇所に起因している。
両方を修正することで根本解決と耐障害性向上を図る。

```
[修正箇所]
┌──────────────────────────────────┐
│ devcontainer.json                │  ← postCreateCommand に fonts-noto-cjk 追加
│  postCreateCommand               │
└──────────────────────────────────┘
          ↓ コンテナ起動時に自動実行
┌──────────────────────────────────┐
│ OS フォントキャッシュ             │  ← fonts-noto-cjk インストールで充足
│ (fc-list :lang=ja)               │
└──────────────────────────────────┘
          ↓ electron が参照
┌──────────────────────────────────┐
│ CSS fontFamily スタック           │  ← 'Noto Sans CJK JP' を先頭付近に追加
│ App.tsx / QuickCaptureForm.tsx   │
└──────────────────────────────────┘
```

## コンポーネント設計

### 1. devcontainer.json の修正

**責務**:
- コンテナ作成時に日本語フォントを自動インストールする

**実装の要点**:
- `postCreateCommand` を配列形式に変更し複数コマンドを実行
- または `&&` で連結した文字列形式を使用
- `sudo apt-get install -y fonts-noto-cjk` を `npm install` より先に実行する

### 2. CSS フォントスタックの改善

**責務**:
- 日本語グリフを持つフォントを優先的に参照させる

**実装の要点**:
- `fontFamily` に `'Noto Sans CJK JP', 'Noto Sans JP'` を先頭に追加
- 既存の `system-ui, sans-serif` はフォールバックとして残す
- 対象ファイル:
  - `src/renderer/App.tsx` — `styles.container.fontFamily`
  - `src/renderer/components/capture/QuickCaptureForm.tsx` — `styles.container.fontFamily`

## データフロー

### コンテナ起動時
```
1. devcontainer.json の postCreateCommand が実行される
2. apt-get install -y fonts-noto-cjk でフォントをインストール
3. npm install で依存関係をインストール
4. fc-cache が自動更新される
5. Electron 起動時に Noto Sans CJK JP が利用可能
```

## エラーハンドリング戦略

特になし（フォントがなくても '□' に fallback するだけでクラッシュしない）。

## テスト戦略

### 手動確認
- `fc-list :lang=ja` で日本語フォントが表示されることを確認
- アプリを起動して日本語が正しく表示されることを目視確認

### 自動テスト
- 既存テストへの影響なし（フォントはテスト環境に依存しない）

## 依存ライブラリ

新しい npm ライブラリは不要。OS パッケージのみ:

```
fonts-noto-cjk (apt パッケージ)
```

## ディレクトリ構造

```
変更するファイル:
.devcontainer/devcontainer.json          ← postCreateCommand にフォントインストール追加
src/renderer/App.tsx                     ← fontFamily に日本語フォント追加
src/renderer/components/capture/
  QuickCaptureForm.tsx                   ← fontFamily に日本語フォント追加
```

## 実装の順序

1. システムへの日本語フォントインストール（即時効果あり）
2. devcontainer.json の修正（恒久化）
3. CSS フォントスタックの改善（明示的指定）
