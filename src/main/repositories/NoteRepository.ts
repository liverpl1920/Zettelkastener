import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Note, CreateNoteInput, NoteType } from '@shared/types';

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

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    folgezettelId: row.folgezettel_id,
    type: row.type,
    title: row.title,
    content: row.content,
    sourceTagIds: [], // 今フェーズでは未実装（後続機能7で対応）
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    processedAt: row.processed_at,
  };
}

export class NoteRepository {
  constructor(private readonly db: Database.Database) {}

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
    return rowToNote(row);
  }

  /**
   * ID でノートを取得する
   *
   * @param id - ノートの UUID
   * @returns ノートまたは null（存在しない場合）
   */
  findById(id: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined;
    return row ? rowToNote(row) : null;
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
    return rows.map(rowToNote);
  }

  /**
   * ノートを削除する
   *
   * @param id - 削除するノートの UUID
   */
  delete(id: string): void {
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }
}
