import Database from 'better-sqlite3';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

let db: Database.Database | null = null;

/**
 * SQLite データベース接続を取得する（シングルトン）
 *
 * @param dbPath - データベースファイルのパス。省略時は userData ディレクトリの zettelkastener.db
 * @returns Database インスタンス
 */
export function getDatabase(dbPath?: string): Database.Database {
  if (db) {
    return db;
  }

  const resolvedPath = dbPath ?? getDefaultDbPath();
  ensureDirectoryExists(path.dirname(resolvedPath));

  logger.info('Opening database', { path: resolvedPath });
  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
}

/**
 * データベース接続を閉じる（テスト後のクリーンアップ用）
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * インメモリ DB を作成してテスト用に使用する
 */
export function createInMemoryDatabase(): Database.Database {
  const memDb = new Database(':memory:');
  memDb.pragma('foreign_keys = ON');
  runMigrations(memDb);
  return memDb;
}

function getDefaultDbPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'zettelkastener.db');
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function runMigrations(database: Database.Database): void {
  // マイグレーション管理テーブルを作成
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const appliedVersions = new Set<number>(
    database
      .prepare('SELECT version FROM schema_migrations')
      .all()
      .map((row) => (row as { version: number }).version)
  );

  const migrations: Array<{ version: number; sql: string }> = [
    { version: 1, sql: getMigration001() },
  ];

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      logger.info('Applying migration', { version: migration.version });
      database.exec(migration.sql);
      database
        .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
        .run(migration.version, new Date().toISOString());
    }
  }
}

function getMigration001(): string {
  return `
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
  `;
}
