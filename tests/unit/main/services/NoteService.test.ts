import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteService, DatabaseError } from '../../../../src/main/services/NoteService';
import type { NoteRepository } from '../../../../src/main/repositories/NoteRepository';
import type { Note, CreateNoteInput } from '../../../../src/shared/types';

// NoteRepository のモック
function createMockNoteRepository(
  overrides: Partial<NoteRepository> = {}
): NoteRepository {
  return {
    insert: vi.fn(),
    findById: vi.fn(),
    findByType: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as NoteRepository;
}

function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'test-uuid',
    folgezettelId: null,
    type: 'fleeting',
    title: '',
    content: 'テストメモ',
    sourceTagIds: [],
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-08T00:00:00.000Z',
    processedAt: null,
    ...overrides,
  };
}

describe('NoteService', () => {
  describe('create', () => {
    it('Fleeting Note を正常に作成できる', () => {
      // Arrange
      const mockNote = createMockNote();
      const mockRepo = createMockNoteRepository({
        insert: vi.fn().mockReturnValue(mockNote),
      });
      const service = new NoteService(mockRepo);
      const input: CreateNoteInput = { type: 'fleeting', content: 'テストメモ' };

      // Act
      const result = service.create(input);

      // Assert
      expect(result).toEqual(mockNote);
      expect(mockRepo.insert).toHaveBeenCalledWith(input);
    });

    it('DB エラーが発生した場合は DatabaseError をスローする', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        insert: vi.fn().mockImplementation(() => {
          throw new Error('SQLITE_ERROR: disk I/O error');
        }),
      });
      const service = new NoteService(mockRepo);
      const input: CreateNoteInput = { type: 'fleeting', content: 'テストメモ' };

      // Act & Assert
      expect(() => service.create(input)).toThrow(DatabaseError);
    });
  });

  describe('getById', () => {
    it('存在するノートを返す', () => {
      // Arrange
      const mockNote = createMockNote();
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockReturnValue(mockNote),
      });
      const service = new NoteService(mockRepo);

      // Act
      const result = service.getById('test-uuid');

      // Assert
      expect(result).toEqual(mockNote);
    });

    it('存在しない ID の場合は null を返す', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockReturnValue(null),
      });
      const service = new NoteService(mockRepo);

      // Act
      const result = service.getById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    it('Fleeting Note は制約なしでバリデーションを通過する', () => {
      // Arrange
      const mockRepo = createMockNoteRepository();
      const service = new NoteService(mockRepo);

      // Act
      const result = service.validate({ type: 'fleeting', content: 'メモ' }, []);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('Permanent Note でリンクが 0 件の場合はバリデーションエラーになる', () => {
      // Arrange
      const mockRepo = createMockNoteRepository();
      const service = new NoteService(mockRepo);

      // Act
      const result = service.validate({ type: 'permanent', content: '恒久的なノート' }, []);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('links');
    });

    it('Permanent Note でリンクが 1 件以上あればバリデーションを通過する', () => {
      // Arrange
      const mockRepo = createMockNoteRepository();
      const service = new NoteService(mockRepo);
      const links = [{ fromNoteId: 'a', toNoteId: 'b' }];

      // Act
      const result = service.validate({ type: 'permanent', content: '恒久的なノート' }, links);

      // Assert
      expect(result.valid).toBe(true);
    });

    it('Literature Note で出典タグが空の場合はバリデーションエラーになる', () => {
      // Arrange
      const mockRepo = createMockNoteRepository();
      const service = new NoteService(mockRepo);

      // Act
      const result = service.validate(
        { type: 'literature', content: '文献メモ', sourceTagIds: [] },
        []
      );

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('sourceTagIds');
    });
  });

  describe('getByType', () => {
    it('指定した種別のノート一覧を返す', () => {
      // Arrange
      const mockNotes = [
        createMockNote({ id: 'a', content: 'メモ1' }),
        createMockNote({ id: 'b', content: 'メモ2' }),
      ];
      const mockRepo = createMockNoteRepository({
        findByType: vi.fn().mockReturnValue(mockNotes),
      });
      const service = new NoteService(mockRepo);

      // Act
      const result = service.getByType('fleeting');

      // Assert
      expect(result).toEqual(mockNotes);
      expect(mockRepo.findByType).toHaveBeenCalledWith('fleeting');
    });

    it('ノートが存在しない場合は空配列を返す', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findByType: vi.fn().mockReturnValue([]),
      });
      const service = new NoteService(mockRepo);

      // Act
      const result = service.getByType('permanent');

      // Assert
      expect(result).toEqual([]);
    });

    it('DB エラーが発生した場合は DatabaseError をスローする', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findByType: vi.fn().mockImplementation(() => {
          throw new Error('SQLITE_ERROR');
        }),
      });
      const service = new NoteService(mockRepo);

      // Act & Assert
      expect(() => service.getByType('fleeting')).toThrow(DatabaseError);
    });
  });
});
