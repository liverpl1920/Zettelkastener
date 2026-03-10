import type { CreateNoteInput, IPCResult, Note, NoteType } from './types';

// Renderer Process の window オブジェクトに公開される API の型定義
declare global {
  interface Window {
    api: {
      notes: {
        create: (input: CreateNoteInput) => Promise<IPCResult<Note>>;
        getById: (id: string) => Promise<IPCResult<Note | null>>;
        getByType: (type: NoteType) => Promise<IPCResult<Note[]>>;
        onCreated: (callback: (note: Note) => void) => () => void;
      };
      window: {
        closeQuickCapture: () => void;
      };
    };
  }
}
