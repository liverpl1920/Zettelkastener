# 設計: Git操作統合

## 実装アプローチ

### 全体構成

```
.github/
├── copilot-instructions.md        # Git戦略セクションを追記
├── prompts/
│   ├── add-feature.prompt.md      # ステップ0(Git準備)・ステップ9(PR作成)を追加
│   └── commit.prompt.md           # 新規作成（単発コミット用）
└── skills/
    └── git-workflow/
        └── SKILL.md               # 新規作成（Gitワークフロー定義）
```

### 1. `git-workflow` スキル

**役割**: Gitに関するすべてのルール・手順を一元管理する

**定義する内容**:
- ブランチ命名規則
- Conventional Commits 規約（type・scope・message形式）
- コミットタイミングのルール（Phase完了時）  
- PR本文のテンプレート（ステアリングドキュメントから自動生成）
- GitHub CLI コマンドの具体的な手順

**参照タイミング**:
- `add-feature.prompt.md` のGitステップ
- `commit.prompt.md` プロンプト全体

### 2. `add-feature.prompt.md` への追加

**ステップ0（最初に追加）**: Git準備
```
1. git status で現在の状態確認
2. git checkout main && git pull
3. git checkout -b feature/[日付]-[機能名]
4. ブランチ名をrequirements.mdに記録
```

**ステップ5ループ内に追記**: フェーズ完了時コミット
```
各Phaseの全タスクが[x]になったら:
- git add -A
- git commit -m "[Conventional Commits形式メッセージ]"
```

**ステップ9（最後に追加）**: PR作成
```
1. git push -u origin [ブランチ名]
2. steering ドキュメントからPR本文を生成
3. gh pr create コマンドを実行
```

### 3. `commit.prompt.md`（新規）

**用途**: 手動で単発コミットしたいとき

**フロー**:
```
1. git diff --staged の内容を取得・分析
2. ステアリングディレクトリの最新ドキュメントをコンテキストに読む  
3. Conventional Commits形式でメッセージを生成
4. ユーザーに確認後、git commit を実行
```

### 4. `copilot-instructions.md` への追記

**追加するセクション**:
```markdown
## Git戦略

### ブランチ戦略
### コミット規約（Conventional Commits）
### コミットタイミング
### 前提ツール
```

**配置場所**: 「開発プロセス」セクションの直後

## 技術的決定事項

| 決定 | 理由 |
|---|---|
| ブランチ名をステアリングディレクトリ名と統一 | トレーサビリティの確保 |
| Phase単位でコミット | コミット粒度の統一・レビューしやすさ |
| gh CLI でPR作成 | 既存 npm スクリプトと統合不要・シンプル |
| commit.prompt.md は確認ステップあり | 誤コミット防止 |
