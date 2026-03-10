import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryDatabase } from '../../src/main/db/database';
import { NoteRepository } from '../../src/main/repositories/NoteRepository';
import { NoteService } from '../../src/main/services/NoteService';
import type { Database } from 'better-sqlite3';

let db: Database;
let noteRepository: NoteRepository;
let noteService: NoteService;

beforeEach(() => {
  db = createInMemoryDatabase();
  noteRepository = new NoteRepository(db);
  noteService = new NoteService(noteRepository);
});

describe('Note CRUD 統合テスト', () => {
  describe('create + getById', () => {
    it('Fleeting Note を作成して ID で取得できる', () => {
      // Arrange
      const input = { type: 'fleeting' as const, content: '統合テスト用メモ' };

      // Act
      const created = noteService.create(input);
      const fetched = noteService.getById(created.id);

      // Assert
      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe(created.id);
      expect(fetched!.content).toBe('統合テスト用メモ');
      expect(fetched!.type).toBe('fleeting');
    });

    it('存在しない ID の場合は null を返す', () => {
      // Act
      const result = noteService.getById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('作成日時が ISO 8601 形式で設定される', () => {
      // Arrange
      const input = { type: 'fleeting' as const, content: 'タイムスタンプテスト' };

      // Act
      const created = noteService.create(input);

      // Assert
      expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(created.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('複数のノートを作成してそれぞれ独立した ID が付与される', () => {
      // Arrange & Act
      const note1 = noteService.create({ type: 'fleeting', content: 'メモ1' });
      const note2 = noteService.create({ type: 'fleeting', content: 'メモ2' });

      // Assert
      expect(note1.id).not.toBe(note2.id);
      expect(noteService.getById(note1.id)!.content).toBe('メモ1');
      expect(noteService.getById(note2.id)!.content).toBe('メモ2');
    });
  });

  describe('NoteRepository.findByType', () => {
    it('指定タイプのノートのみ返す', () => {
      // Arrange
      noteService.create({ type: 'fleeting', content: 'フリーティング1' });
      noteService.create({ type: 'fleeting', content: 'フリーティング2' });
      noteService.create({ type: 'permanent', content: 'パーマネント1' });

      // Act
      const fleetingNotes = noteRepository.findByType('fleeting');
      const permanentNotes = noteRepository.findByType('permanent');

      // Assert
      expect(fleetingNotes).toHaveLength(2);
      expect(permanentNotes).toHaveLength(1);
      fleetingNotes.forEach((n) => expect(n.type).toBe('fleeting'));
    });
  });

  describe('NoteRepository.delete', () => {
    it('ノートを削除後、getById は null を返す', () => {
      // Arrange
      const created = noteService.create({ type: 'fleeting', content: '削除テスト' });

      // Act
      noteRepository.delete(created.id);
      const fetched = noteService.getById(created.id);

      // Assert
      expect(fetched).toBeNull();
    });
  });
});
