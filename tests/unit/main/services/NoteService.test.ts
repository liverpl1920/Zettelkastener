import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NoteService,
  DatabaseError,
  NoteNotFoundError,
  InputValidationError,
} from '../../../../src/main/services/NoteService';
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
    update: vi.fn(),
    insertSourceTag: vi.fn(),
    linkNoteToSourceTag: vi.fn(),
    findSourceTagsByNoteId: vi.fn(),
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

  describe('delete', () => {
    it('存在するノートを削除できる', () => {
      // Arrange
      const mockNote = createMockNote();
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockReturnValue(mockNote),
        delete: vi.fn(),
      });
      const service = new NoteService(mockRepo);

      // Act
      service.delete('test-uuid');

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith('test-uuid');
    });

    it('存在しないノートを削除しようとすると NoteNotFoundError をスローする', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockReturnValue(null),
      });
      const service = new NoteService(mockRepo);

      // Act & Assert
      expect(() => service.delete('nonexistent')).toThrow(NoteNotFoundError);
    });

    it('DB エラーが発生した場合は DatabaseError をスローする', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockImplementation(() => {
          throw new Error('SQLITE_ERROR');
        }),
      });
      const service = new NoteService(mockRepo);

      // Act & Assert
      expect(() => service.delete('test-uuid')).toThrow(DatabaseError);
    });
  });

  describe('promote', () => {
    describe('Literature Note への変換', () => {
      it('有効な出典タグがあれば Literature Note に変換できる', () => {
        // Arrange
        const fleetingNote = createMockNote({ type: 'fleeting', content: '文献メモ' });
        const literatureNote = createMockNote({ type: 'literature', content: '文献メモ' });
        const mockSourceTag = { id: 'tag-1', key: 'author', value: 'Ahrens', createdAt: '2026-03-11T00:00:00.000Z' };
        const mockRepo = createMockNoteRepository({
          findById: vi.fn().mockReturnValue(fleetingNote),
          insertSourceTag: vi.fn().mockReturnValue(mockSourceTag),
          linkNoteToSourceTag: vi.fn(),
          update: vi.fn().mockReturnValue(literatureNote),
        });
        const service = new NoteService(mockRepo);

        // Act
        const result = service.promote('test-uuid', 'literature', {
          sourceTagTexts: ['@author:Ahrens'],
        });

        // Assert
        expect(result.type).toBe('literature');
        expect(mockRepo.insertSourceTag).toHaveBeenCalledWith('author', 'Ahrens');
        expect(mockRepo.linkNoteToSourceTag).toHaveBeenCalledWith('test-uuid', 'tag-1');
      });

      it('出典タグが空の場合は InputValidationError をスローする', () => {
        // Arrange
        const fleetingNote = createMockNote({ type: 'fleeting' });
        const mockRepo = createMockNoteRepository({
          findById: vi.fn().mockReturnValue(fleetingNote),
        });
        const service = new NoteService(mockRepo);

        // Act & Assert
        expect(() =>
          service.promote('test-uuid', 'literature', { sourceTagTexts: [] })
        ).toThrow(InputValidationError);
      });

      it('不正フォーマットのタグのみの場合は InputValidationError をスローする', () => {
        // Arrange
        const fleetingNote = createMockNote({ type: 'fleeting' });
        const mockRepo = createMockNoteRepository({
          findById: vi.fn().mockReturnValue(fleetingNote),
        });
        const service = new NoteService(mockRepo);

        // Act & Assert
        expect(() =>
          service.promote('test-uuid', 'literature', { sourceTagTexts: ['invalid-format'] })
        ).toThrow(InputValidationError);
      });
    });

    describe('Permanent Note への変換', () => {
      it('Fleeting Note を Permanent Note に変換できる', () => {
        // Arrange
        const fleetingNote = createMockNote({ type: 'fleeting', content: '恒久メモ' });
        const permanentNote = createMockNote({ type: 'permanent', content: '恒久メモ' });
        const mockRepo = createMockNoteRepository({
          findById: vi.fn().mockReturnValue(fleetingNote),
          update: vi.fn().mockReturnValue(permanentNote),
        });
        const service = new NoteService(mockRepo);

        // Act
        const result = service.promote('test-uuid', 'permanent', {});

        // Assert
        expect(result.type).toBe('permanent');
        expect(mockRepo.update).toHaveBeenCalledWith(
          'test-uuid',
          expect.objectContaining({ type: 'permanent' })
        );
      });

      it('content が指定された場合はその内容で上書きされる', () => {
        // Arrange
        const fleetingNote = createMockNote({ type: 'fleeting', content: '元の内容' });
        const permanentNote = createMockNote({ type: 'permanent', content: '書き直した内容' });
        const mockRepo = createMockNoteRepository({
          findById: vi.fn().mockReturnValue(fleetingNote),
          update: vi.fn().mockReturnValue(permanentNote),
        });
        const service = new NoteService(mockRepo);

        // Act
        service.promote('test-uuid', 'permanent', { content: '書き直した内容' });

        // Assert
        expect(mockRepo.update).toHaveBeenCalledWith(
          'test-uuid',
          expect.objectContaining({ content: '書き直した内容' })
        );
      });
    });

    it('存在しないノートを変換しようとすると NoteNotFoundError をスローする', () => {
      // Arrange
      const mockRepo = createMockNoteRepository({
        findById: vi.fn().mockReturnValue(null),
      });
      const service = new NoteService(mockRepo);

      // Act & Assert
      expect(() =>
        service.promote('nonexistent', 'permanent', {})
      ).toThrow(NoteNotFoundError);
    });
  });
});
