-- マイグレーション: 001_initial
-- 初回スキーマ作成（schema.sqlと同じ内容をマイグレーションとして管理）

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  folgezettel_id TEXT UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('fleeting', 'literature', 'permanent', 'index')),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  from_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  to_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(from_note_id, to_note_id)
);

CREATE TABLE IF NOT EXISTS source_tags (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS note_source_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  source_tag_id TEXT NOT NULL REFERENCES source_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, source_tag_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title,
  content,
  content=notes,
  content_rowid=rowid
);
