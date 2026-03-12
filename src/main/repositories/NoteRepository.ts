import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Note, CreateNoteInput, NoteType, SourceTag } from '@shared/types';

interface NoteRow {
  id: string;
  folgezettel_id: string | null;
  type: NoteType;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

interface SourceTagRow {
  id: string;
  key: string;
  value: string;
  created_at: string;
}

interface UpdateNoteFields {
  type?: NoteType;
  title?: string;
  content?: string;
  processedAt?: string | null;
}

function rowToNote(row: NoteRow, sourceTagIds: string[] = []): Note {
  return {
    id: row.id,
    folgezettelId: row.folgezettel_id,
    type: row.type,
    title: row.title,
    content: row.content,
    sourceTagIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    processedAt: row.processed_at,
  };
}

export class NoteRepository {
  constructor(private readonly db: Database.Database) {}

  /**
   * ノートに紐付く出典タグ ID を取得するプライベートヘルパー
   */
  private fetchSourceTagIds(noteId: string): string[] {
    const rows = this.db
      .prepare(
        `SELECT st.id FROM source_tags st
         INNER JOIN note_source_tags nst ON nst.source_tag_id = st.id
         WHERE nst.note_id = ?`
      )
      .all(noteId) as { id: string }[];
    return rows.map((r) => r.id);
  }

  /**
   * ノートを新規挿入する
   *
   * @param input - 作成入力
   * @returns 作成されたノート
   */
  insert(input: CreateNoteInput): Note {
    const now = new Date().toISOString();
    const id = uuidv4();

    this.db
      .prepare(
        `INSERT INTO notes (id, folgezettel_id, type, title, content, created_at, updated_at, processed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, null, input.type, input.title ?? '', input.content, now, now, null);

    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow;
    return rowToNote(row, this.fetchSourceTagIds(id));
  }

  /**
   * ID でノートを更新する
   *
   * @param id - 更新するノートの UUID
   * @param fields - 更新するフィールド
   * @returns 更新後のノート
   */
  update(id: string, fields: UpdateNoteFields): Note {
    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (fields.type !== undefined) {
      setClauses.push('type = ?');
      values.push(fields.type);
    }
    if (fields.title !== undefined) {
      setClauses.push('title = ?');
      values.push(fields.title);
    }
    if (fields.content !== undefined) {
      setClauses.push('content = ?');
      values.push(fields.content);
    }
    if (fields.processedAt !== undefined) {
      setClauses.push('processed_at = ?');
      values.push(fields.processedAt);
    }

    values.push(id);

    this.db.prepare(`UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow;
    return rowToNote(row, this.fetchSourceTagIds(id));
  }

  /**
   * ID でノートを取得する
   *
   * @param id - ノートの UUID
   * @returns ノートまたは null（存在しない場合）
   */
  findById(id: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined;
    if (!row) return null;
    return rowToNote(row, this.fetchSourceTagIds(id));
  }

  /**
   * 種別でノートをすべて取得する
   *
   * @param type - ノート種別
   * @returns ノートの配列
   */
  findByType(type: NoteType): Note[] {
    const rows = this.db
      .prepare('SELECT * FROM notes WHERE type = ? ORDER BY created_at DESC')
      .all(type) as NoteRow[];
    return rows.map((row) => rowToNote(row, this.fetchSourceTagIds(row.id)));
  }

  /**
   * ノートを削除する
   *
   * @param id - 削除するノートの UUID
   */
  delete(id: string): void {
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }

  /**
   * 出典タグを挿入する（同一 key / value が存在する場合は既存を返す）
   *
   * @param key - タグキー（例: "author"）
   * @param value - タグ値（例: "Ahrens"）
   * @returns 出典タグ
   */
  insertSourceTag(key: string, value: string): SourceTag {
    // 同一 key/value が既に存在する場合は再利用する
    const existing = this.db
      .prepare('SELECT * FROM source_tags WHERE key = ? AND value = ?')
      .get(key, value) as SourceTagRow | undefined;

    if (existing) {
      return { id: existing.id, key: existing.key, value: existing.value, createdAt: existing.created_at };
    }

    const now = new Date().toISOString();
    const id = uuidv4();
    this.db
      .prepare('INSERT INTO source_tags (id, key, value, created_at) VALUES (?, ?, ?, ?)')
      .run(id, key, value, now);

    return { id, key, value, createdAt: now };
  }

  /**
   * ノートと出典タグを紐付ける（重複は無視する）
   *
   * @param noteId - ノートの UUID
   * @param sourceTagId - 出典タグの UUID
   */
  linkNoteToSourceTag(noteId: string, sourceTagId: string): void {
    this.db
      .prepare(
        'INSERT OR IGNORE INTO note_source_tags (note_id, source_tag_id) VALUES (?, ?)'
      )
      .run(noteId, sourceTagId);
  }

  /**
   * ノートに紐付く出典タグを全件取得する
   *
   * @param noteId - ノートの UUID
   * @returns 出典タグの配列
   */
  findSourceTagsByNoteId(noteId: string): SourceTag[] {
    const rows = this.db
      .prepare(
        `SELECT st.id, st.key, st.value, st.created_at FROM source_tags st
         INNER JOIN note_source_tags nst ON nst.source_tag_id = st.id
         WHERE nst.note_id = ?`
      )
      .all(noteId) as SourceTagRow[];
    return rows.map((r) => ({ id: r.id, key: r.key, value: r.value, createdAt: r.created_at }));
  }
}
