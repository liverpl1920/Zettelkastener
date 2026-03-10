import type { Note, CreateNoteInput, ValidationResult, ValidationError } from '@shared/types';
import type { NoteRepository } from '../repositories/NoteRepository';
import { logger } from '../utils/logger';

// ドメイン固有エラークラス（development-guidelines.md#エラーハンドリング 準拠）
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class InputValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly suggestion: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NoteNotFoundError extends AppError {
  constructor(public readonly noteId: string) {
    super(`Note not found: ${noteId}`, 'NOT_FOUND');
    this.name = 'NoteNotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  /**
   * ノートを作成する
   *
   * @param input - 作成入力
   * @returns 作成されたノート
   * @throws {DatabaseError} DB操作に失敗した場合
   */
  create(input: CreateNoteInput): Note {
    try {
      const note = this.noteRepository.insert(input);
      logger.info('Note created', { noteId: note.id, type: note.type });
      return note;
    } catch (error) {
      logger.error('Failed to create note', { error, input });
      throw new DatabaseError('Failed to create note');
    }
  }

  /**
   * ID でノートを取得する
   *
   * @param id - ノートの UUID
   * @returns ノートまたは null（存在しない場合）
   */
  getById(id: string): Note | null {
    try {
      return this.noteRepository.findById(id);
    } catch (error) {
      logger.error('Failed to get note by id', { error, id });
      throw new DatabaseError('Failed to get note');
    }
  }

  /**
   * 種別でノートをすべて取得する
   *
   * @param type - ノート種別
   * @returns ノートの配列（createdAt 降順）
   * @throws {DatabaseError} DB操作に失敗した場合
   */
  getByType(type: Note['type']): Note[] {
    try {
      return this.noteRepository.findByType(type);
    } catch (error) {
      logger.error('Failed to get notes by type', { error, type });
      throw new DatabaseError('Failed to get notes');
    }
  }

  /**
   * ノートをバリデーションする
   *
   * @param note - バリデーション対象（部分的なノートを受け付ける）
   * @param links - ノートに紐づくリンク（Permanent Note の必須リンクチェック用）
   * @returns バリデーション結果
   */
  validate(note: Partial<Note>, links: { fromNoteId: string; toNoteId: string }[]): ValidationResult {
    const errors: ValidationError[] = [];

    // Literature Note: 出典タグ必須（機能7で完全実装）
    if (note.type === 'literature' && (!note.sourceTagIds || note.sourceTagIds.length === 0)) {
      errors.push({
        field: 'sourceTagIds',
        message: 'Literature Noteには出典タグが最低1つ必要です',
        suggestion: '@author: または @title: 形式で出典タグを追加してください',
      });
    }

    // Permanent / Index Note: リンク必須（機能4で UI を完全実装）
    if (
      (note.type === 'permanent' || note.type === 'index') &&
      links.length === 0
    ) {
      errors.push({
        field: 'links',
        message: 'Permanent Noteにはリンクが最低1つ必要です',
        suggestion: '[[ を入力してリンク候補から選んでください',
      });
    }

    return { valid: errors.length === 0, errors };
  }
}
