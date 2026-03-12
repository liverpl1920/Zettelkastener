import { create } from 'zustand';
import type { Note, NoteType } from '@shared/types';

interface NoteState {
  /** 現在ロード済みのノート（正規化マップ: id → Note） */
  notes: Record<string, Note>;
  /** 選択中のノート ID */
  selectedNoteId: string | null;

  /** ノートをストアに追加・上書きする */
  upsertNote: (note: Note) => void;
  /** 複数ノートを一括で追加・上書きする */
  upsertNotes: (notes: Note[]) => void;
  /** ノートをストアから削除する */
  removeNote: (id: string) => void;
  /** ノート種別フィルター済みリストを返す */
  getNotesByType: (type: NoteType) => Note[];
  /** 選択ノートを切り替える */
  selectNote: (id: string | null) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: {},
  selectedNoteId: null,

  upsertNote: (note: Note): void => {
    set((state) => ({
      notes: { ...state.notes, [note.id]: note },
    }));
  },

  upsertNotes: (notes: Note[]): void => {
    set((state) => {
      const updated = { ...state.notes };
      for (const note of notes) {
        updated[note.id] = note;
      }
      return { notes: updated };
    });
  },

  removeNote: (id: string): void => {
    set((state) => {
      const updated = { ...state.notes };
      delete updated[id];
      return {
        notes: updated,
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      };
    });
  },

  getNotesByType: (type: NoteType): Note[] => {
    return Object.values(get().notes).filter((n) => n.type === type);
  },

  selectNote: (id: string | null): void => {
    set({ selectedNoteId: id });
  },
}));
