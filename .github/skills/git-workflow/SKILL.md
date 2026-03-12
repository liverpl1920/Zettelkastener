---
name: git-workflow
description: Gitのブランチ管理・コミット・PR作成の手順とルールを定義するスキル。add-feature.prompt.mdのGitステップおよびcommit.prompt.mdで参照する。
---

# Git Workflow スキル

スペック駆動開発フローにおけるGit操作の標準手順を定義します。

## スキルの目的

- ブランチ命名規則の統一
- Conventional Commits によるコミットメッセージの標準化
- ステアリングディレクトリとブランチの1対1対応によるトレーサビリティ確保
- Phase単位のコミットによる粒度の統一
- GitHub CLIを使ったPR自動生成

---

## 1. ブランチ命名規則

### 形式

```
[type]/[YYYYMMDD]-[タスク名]
```

**typeの選択基準**:

| type | 用途 |
|---|---|
| `feature` | 新機能追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | 機能変更を伴わないコード改善 |
| `chore` | ビルド設定・依存関係更新等 |

**ポイント**: ブランチ名はステアリングディレクトリ名（`.steering/[YYYYMMDD]-[タスク名]/`）と一致させること。

> **⚠️ ブランチtypeとコミットtypeの違い**: ブランチ名には `feature`、`fix` など**完全形**を使う。コミットメッセージには `feat`、`fix` など**短縮形**を使う。例: ブランチ `feature/...` → コミット `feat(scope): ...`。`feat/` というブランチ名は使わない。

### 例

```
feature/20260311-add-user-profile
fix/20260311-fix-note-delete-bug
docs/20260311-update-architecture
refactor/20260311-extract-note-service
```

---

## 2. Conventional Commits 規約

### 形式

```
[type]([scope]): [日本語の説明]
```

### type 一覧

| type | 用途 |
|---|---|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントの追加・変更 |
| `refactor` | リファクタリング（機能変更なし） |
| `test` | テストの追加・修正 |
| `chore` | ビルド設定・依存関係・その他 |
| `style` | コードスタイルの修正（動作変更なし） |
| `perf` | パフォーマンス改善 |

### scope 一覧（このプロジェクト）

| scope | 対応モジュール |
|---|---|
| `notes` | ノート機能全般 |
| `db` | データベース・マイグレーション |
| `ipc` | Electron IPCハンドラー |
| `ui` | Reactコンポーネント・画面 |
| `store` | Zustandストア |
| `capture` | クイックキャプチャ機能 |
| `services` | サービスレイヤー |
| `repos` | リポジトリレイヤー |
| `gh` | Copilot・GitHub関連設定（`.github/` 配下） |
| `steering` | ステアリングファイル（`.steering/` 配下） |
| `deps` | 依存関係（package.json） |

### 例

```
feat(notes): フリーティングノート一覧表示を追加
fix(db): SQLiteの接続タイムアウトを修正
docs(gh): git-workflowスキルを追加
refactor(services): NoteServiceをDI対応に変更
test(services): NoteServiceのユニットテストを追加
chore(deps): electron-builderを最新版に更新
```

### ルール

- 説明は **日本語** で記述する
- 説明は動詞で終わる（「〜を追加」「〜を修正」「〜を更新」）
- 50文字以内を目安にする
- `!` を付けると破壊的変更を示す（例: `feat(ipc)!: IPCチャンネル名を変更`）

---

## 3. コミットタイミング

### 基本ルール

**tasklist.md の Phase（フェーズ）が完了したタイミングでコミットする**

```
Phase 1 完了 → git commit
Phase 2 完了 → git commit
Phase 3 完了 → git commit
...
```

### ドキュメントコミットの分離

ドキュメント変更（`.github/`, `docs/`, `.steering/`）は、**実装コミットとは別にコミットする**。

```
# ステアリングファイル作成時
git add .steering/ .github/
git commit -m "docs(gh): git-workflow統合のステアリングファイルを作成"

# 実装完了後
git add src/
git commit -m "feat(notes): 〜を実装"

# ドキュメント更新後
git add docs/
git commit -m "docs(architecture): 〜を更新"
```

### Phase完了時の手順

```bash
# 1. 変更ファイルを確認
git status

# 2. 実装ファイルのみをステージング（.steering/ は含めない）
git add src/ tests/

# 3. コミットメッセージ生成（このSKILL.mdの規約に従う）
#    変更内容を分析してConventional Commits形式で生成

# 4. 実装コミット
git commit -m "[type]([scope]): [説明]"

# 5. ステアリングファイル（tasklist.md更新分）を別コミット
git add .steering/
git commit -m "docs(steering): [機能名] Phase完了の進捗を記録"
```

> `.steering/` の tasklist.md 更新は実装コミットとは必ず分離すること（ドキュメント分離原則）。

---

## 4. 作業開始手順（ブランチ作成）

```bash
# 1. 現在の状態確認
git status

# 2. 未コミット変更がある場合は処理する
#    → コミットまたはstash

# 3. mainブランチに移動して最新化
git checkout main
git pull origin main

# 4. 作業ブランチを作成
git checkout -b [type]/[YYYYMMDD]-[タスク名]

# 例
git checkout -b feature/20260311-add-user-profile
```

---

## 5. PR作成手順（GitHub CLI使用）

### 前提

- `gh` コマンドがインストール済みであること（`gh --version` で確認）
- `gh auth login` で認証済みであること

### PR本文の生成

以下のステアリングファイルを読み込んでPR本文を生成する:

- `.steering/[日付]-[機能名]/requirements.md` → PR概要・背景
- `.steering/[日付]-[機能名]/design.md` → 実装方針
- `.steering/[日付]-[機能名]/tasklist.md` → 変更内容の箇条書き

**PR本文テンプレート**:

```markdown
## 概要

[requirements.mdの「背景」セクションを要約]

## 変更内容

[tasklist.mdの完了タスクを箇条書きで列挙]

## 実装方針

[design.mdの「実装アプローチ」を要約]

## テスト

- [ ] `npm test` パス
- [ ] `npm run lint` パス  
- [ ] `npm run typecheck` パス

## 関連ドキュメント

- `.steering/[日付]-[機能名]/requirements.md`
- `.steering/[日付]-[機能名]/design.md`
```

### コマンド

```bash
# 1. リモートにプッシュ
git push -u origin [ブランチ名]

# 2. PR作成（タイトルは最後のコミットメッセージから自動生成）
gh pr create \
  --title "[type]([scope]): [機能名]" \
  --body "[生成したPR本文]" \
  --base main

# または対話形式
gh pr create --fill
```

---

## 6. よくあるケースの対処

### mainブランチで誤って作業してしまった場合

```bash
# 変更を退避
git stash

# ブランチ作成
git checkout -b feature/[日付]-[機能名]

# 変更を戻す
git stash pop
```

### コミットメッセージを修正したい場合（未プッシュ）

```bash
git commit --amend -m "[修正後のメッセージ]"
```

### gh コマンドが使えない場合

ブラウザでGitHubを開き、PR本文テンプレートを参考に手動でPRを作成する。
