# 要求内容

## 概要

GUI上の日本語文字列が '□'（豆腐）として表示される問題を修正する。
システムへの日本語フォントインストールと devcontainer の自動化設定を行う。

## 背景

Electron アプリのレンダラーが CSS `system-ui, sans-serif` でフォントを指定しているが、
Ubuntu 24.04 環境に日本語対応フォントが一切インストールされていないため、
日本語グリフが '□' として表示されてしまっている。

`fc-list :lang=ja` の結果が空であることで確認済み。

## 実装対象の機能

### 1. 日本語フォントのインストール

- `fonts-noto-cjk` パッケージをシステムにインストールする
- devcontainer の `postCreateCommand` に日本語フォントのインストールを追加し、
  コンテナ再作成時も自動的に対応できるようにする

### 2. CSS フォントスタックの改善

- 全コンポーネントの `fontFamily` 指定に日本語フォントを明示的に追加する
- フォールバックの順序を適切に設定する

## 受け入れ条件

### 日本語フォントのインストール
- [ ] `fc-list :lang=ja` に1件以上の結果が表示される
- [ ] `.devcontainer/devcontainer.json` の `postCreateCommand` に `fonts-noto-cjk` のインストールが含まれる

### CSS フォントスタックの改善
- [ ] `App.tsx` の `fontFamily` に日本語フォントが明示されている
- [ ] `QuickCaptureForm.tsx` の `fontFamily` に日本語フォントが明示されている

## 成功指標

- アプリ上の全日本語テキストが正常に表示される
- コンテナ再作成後も自動で日本語フォントが利用可能な状態になる

## スコープ外

以下はこのフェーズでは実装しません:

- アプリ独自フォントファイル（woff2 等）のバンドル
- フォント設定の UI 提供

## 参照ドキュメント

- `docs/architecture.md` - アーキテクチャ設計書
- `docs/development-guidelines.md` - 開発ガイドライン
