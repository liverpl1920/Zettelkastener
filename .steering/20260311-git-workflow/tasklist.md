# タスクリスト: Git操作統合

## Phase 1: スキル作成

- [x] `.github/skills/git-workflow/SKILL.md` を作成する
  - [x] ブランチ命名規則を定義
  - [x] Conventional Commits 規約を定義（type/scope/message形式）
  - [x] コミットタイミングのルールを定義（Phase単位）
  - [x] PRテンプレート（ステアリングドキュメントから生成する手順）を定義
  - [x] GitHub CLI コマンドの具体的な手順を記載

## Phase 2: commit.prompt.md 作成

- [x] `.github/prompts/commit.prompt.md` を新規作成する
  - [x] `git diff --staged` 取得・分析ステップ
  - [x] ステアリングドキュメントをコンテキスト読み込みするステップ
  - [x] Conventional Commits形式でメッセージ生成するステップ
  - [x] ユーザー確認後 `git commit` 実行するステップ

## Phase 3: add-feature.prompt.md 更新

- [x] ステップ0「Git準備」を既存ステップ1の前に追加する
  - [x] `git status` で現在の状態確認
  - [x] `git checkout main && git pull` の実行
  - [x] `git checkout -b feature/[日付]-[機能名]` の実行
  - [x] ブランチ名を `requirements.md` に記録
- [x] ステップ5ループ内にフェーズ完了時コミット手順を追加する
  - [x] 各Phaseのタスクが全て `[x]` になったら `git commit` する記述
  - [x] `#skill-git-workflow` スキル参照の記述
- [x] ステップ9「PR作成」を末尾に追加する
  - [x] `git push -u origin [ブランチ名]` の実行
  - [x] `requirements.md` と `design.md` からPR本文を生成
  - [x] `gh pr create` コマンドの実行
- [x] 完了条件にステップ9の条件を追記する

## Phase 4: copilot-instructions.md 更新

- [x] `## Git戦略` セクションを追加する
  - [x] ブランチ戦略（main / feature / fix ブランチの定義）
  - [x] コミット規約（Conventional Commits）
  - [x] コミットタイミング（Phase単位・ドキュメント分離）
  - [x] 前提ツール（GitHub CLI）
- [x] `## スキル一覧` に `git-workflow/SKILL.md` を追記する
- [x] `## プロンプトファイル一覧` に `commit.prompt.md` を追記する

---

## 実装後の振り返り

**実装完了日**: 2026-03-13

**計画と実績の差分**:
- 計画通りに全4フェーズを完了
- ステップ1にステアリングファイル作成後のコミットを追加した（計画に明示されていなかったが自然な追加）
- `add-feature.prompt.md` はユーザーが既に更新済みのファイルを添付していたため、差分のみを精査して適用した

**学んだこと**:
- `copilot-instructions.md` の `<skills>` ブロックと `## スキル一覧` セクションの両方を更新する必要がある（一方を忘れると参照が壊れる）
- `add-feature.prompt.md` でループの番号付けがズレる（5→6に変更）のは注意が必要

**次回への改善提案**:
- `gh` CLIが使えない環境向けに、PR本文をクリップボードにコピーする代替手順も明記するとよい
- ブランチ作成時に `refactor/` `chore/` 等のtypeも使えるよう、ステップ0の説明を汎用化する余地がある

