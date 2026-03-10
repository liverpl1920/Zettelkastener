import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryDatabase } from '../../src/main/db/database';
import { NoteRepository } from '../../src/main/repositories/NoteRepository';
import { NoteService, NoteNotFoundError, InputValidationError } from '../../src/main/services/NoteService';
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

  describe('NoteService.delete', () => {
    it('ノートを削除後、getById は null を返す', () => {
      // Arrange
      const created = noteService.create({ type: 'fleeting', content: '削除テスト' });

      // Act
      noteService.delete(created.id);
      const fetched = noteService.getById(created.id);

      // Assert
      expect(fetched).toBeNull();
    });

    it('存在しないノートを削除しようとすると NoteNotFoundError をスローする', () => {
      // Act & Assert
      expect(() => noteService.delete('nonexistent-id')).toThrow(NoteNotFoundError);
    });
  });

  describe('NoteService.promote', () => {
    describe('Literature Note への変換', () => {
      it('Fleeting Note を Literature Note に変換できる', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '文献メモ' });

        // Act
        const promoted = noteService.promote(fleeting.id, 'literature', {
          sourceTagTexts: ['@author:Ahrens', '@title:How to Take Smart Notes'],
        });

        // Assert
        expect(promoted.type).toBe('literature');
        expect(promoted.id).toBe(fleeting.id);
        expect(promoted.processedAt).not.toBeNull();
      });

      it('変換後のノートに sourceTagIds が設定される', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '文献メモ' });

        // Act
        const promoted = noteService.promote(fleeting.id, 'literature', {
          sourceTagTexts: ['@author:Ahrens'],
        });

        // Assert
        expect(promoted.sourceTagIds).toHaveLength(1);
      });

      it('出典タグが空の場合は InputValidationError をスローする', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '文献メモ' });

        // Act & Assert
        expect(() =>
          noteService.promote(fleeting.id, 'literature', { sourceTagTexts: [] })
        ).toThrow(InputValidationError);
      });

      it('同一 key/value の出典タグは重複して挿入されない', () => {
        // Arrange
        const fleeting1 = noteService.create({ type: 'fleeting', content: 'メモ1' });
        const fleeting2 = noteService.create({ type: 'fleeting', content: 'メモ2' });

        // Act
        noteService.promote(fleeting1.id, 'literature', {
          sourceTagTexts: ['@author:Ahrens'],
        });
        noteService.promote(fleeting2.id, 'literature', {
          sourceTagTexts: ['@author:Ahrens'],
        });

        // Assert — source_tags テーブルには1件のみのはず
        const rows = db.prepare("SELECT COUNT(*) as cnt FROM source_tags WHERE key = 'author' AND value = 'Ahrens'").get() as { cnt: number };
        expect(rows.cnt).toBe(1);
      });

      it('本文を書き直して変換できる', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '元の内容' });

        // Act
        const promoted = noteService.promote(fleeting.id, 'literature', {
          content: '書き直した内容',
          sourceTagTexts: ['@author:Ahrens'],
        });

        // Assert
        expect(promoted.content).toBe('書き直した内容');
      });
    });

    describe('Permanent Note への変換', () => {
      it('Fleeting Note を Permanent Note に変換できる', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '恒久メモ' });

        // Act
        const promoted = noteService.promote(fleeting.id, 'permanent', {});

        // Assert
        expect(promoted.type).toBe('permanent');
        expect(promoted.id).toBe(fleeting.id);
        expect(promoted.processedAt).not.toBeNull();
      });

      it('content 指定時は本文が上書きされる', () => {
        // Arrange
        const fleeting = noteService.create({ type: 'fleeting', content: '元の内容' });

        // Act
        const promoted = noteService.promote(fleeting.id, 'permanent', {
          content: '書き直した恒久メモ',
        });

        // Assert
        expect(promoted.content).toBe('書き直した恒久メモ');
      });
    });

    it('存在しないノートを変換しようとすると NoteNotFoundError をスローする', () => {
      // Act & Assert
      expect(() =>
        noteService.promote('nonexistent-id', 'permanent', {})
      ).toThrow(NoteNotFoundError);
    });
  });
});
