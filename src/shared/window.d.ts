import type { CreateNoteInput, IPCResult, Note, NoteType, PromoteInput } from './types';

// Renderer Process の window オブジェクトに公開される API の型定義
declare global {
  interface Window {
    api: {
      notes: {
        create: (input: CreateNoteInput) => Promise<IPCResult<Note>>;
        getById: (id: string) => Promise<IPCResult<Note | null>>;
        getByType: (type: NoteType) => Promise<IPCResult<Note[]>>;
        onCreated: (callback: (note: Note) => void) => () => void;
        delete: (id: string) => Promise<IPCResult<void>>;
        promote: (
          fleetingId: string,
          targetType: 'literature' | 'permanent',
          input: PromoteInput
        ) => Promise<IPCResult<Note>>;
      };
      window: {
        closeQuickCapture: () => void;
      };
    };
  }
}
