import React, { useEffect, useState } from 'react';
import type { Note } from '@shared/types';
import { useNoteStore } from '../../stores/useNoteStore';
import { ConvertNoteModal } from './ConvertNoteModal';

type ModalState =
  | { open: false }
  | { open: true; note: Note; targetType: 'literature' | 'permanent' };

/**
 * Fleeting Note 一覧コンポーネント
 *
 * - マウント時に IPC 経由で Fleeting Note をすべて取得して表示する
 * - クイックキャプチャで保存した新しいノートは note:created イベントで即座に反映される
 * - 各ノートの削除・変換（Literature / Permanent）を提供する
 */
export function FleetingNoteList(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });

  const upsertNote = useNoteStore((state) => state.upsertNote);
  const upsertNotes = useNoteStore((state) => state.upsertNotes);
  const removeNote = useNoteStore((state) => state.removeNote);
  const notes = useNoteStore((state) =>
    state.getNotesByType('fleeting').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  // 初回マウント時に既存の Fleeting Note を全件取得する
  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const result = await window.api.notes.getByType('fleeting');
        if (cancelled) return;
        if (result.success && result.data) {
          upsertNotes(result.data);
        } else {
          setError(result.error?.message ?? '取得に失敗しました');
        }
      } catch (e) {
        if (!cancelled) {
          setError('ノートの取得中にエラーが発生しました');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return (): void => {
      cancelled = true;
    };
  }, [upsertNotes]);

  // クイックキャプチャで保存されたノートをリアルタイムで受け取る
  useEffect(() => {
    const unsubscribe = window.api.notes.onCreated((note: Note) => {
      if (note.type === 'fleeting') {
        upsertNote(note);
      }
    });
    return unsubscribe;
  }, [upsertNote]);

  const handleDelete = async (note: Note): Promise<void> => {
    const confirmed = window.confirm(`「${note.title || note.content.slice(0, 30) || '（空のノート）'}」を削除しますか？`);
    if (!confirmed) return;

    const result = await window.api.notes.delete(note.id);
    if (result.success) {
      removeNote(note.id);
    }
  };

  const handleOpenModal = (note: Note, targetType: 'literature' | 'permanent'): void => {
    setModal({ open: true, note, targetType });
  };

  const handleCloseModal = (): void => {
    setModal({ open: false });
  };

  if (isLoading) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.empty}>
        <p style={{ ...styles.emptyText, color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>まだ Fleeting Note がありません</p>
        <p style={styles.hint}>Ctrl+Shift+N でメモを追加できます</p>
      </div>
    );
  }

  return (
    <>
      <ul style={styles.list} aria-label="Fleeting Note 一覧">
        {notes.map((note) => (
          <FleetingNoteItem
            key={note.id}
            note={note}
            onDelete={handleDelete}
            onConvert={handleOpenModal}
          />
        ))}
      </ul>
      {modal.open && (
        <ConvertNoteModal
          note={modal.note}
          targetType={modal.targetType}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

interface FleetingNoteItemProps {
  note: Note;
  onDelete: (note: Note) => void;
  onConvert: (note: Note, targetType: 'literature' | 'permanent') => void;
}

function FleetingNoteItem({ note, onDelete, onConvert }: FleetingNoteItemProps): React.ReactElement {
  const preview = note.content.length > 120 ? note.content.slice(0, 120) + '…' : note.content;
  const dateLabel = new Date(note.createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li style={styles.item}>
      <time style={styles.date} dateTime={note.createdAt}>
        {dateLabel}
      </time>
      <p style={styles.preview}>{preview || <em style={styles.emptyNote}>（内容なし）</em>}</p>
      <div style={styles.actions}>
        <button
          style={{ ...styles.actionButton, ...styles.literatureButton }}
          onClick={() => onConvert(note, 'literature')}
          title="Literature Note に変換"
        >
          → Literature
        </button>
        <button
          style={{ ...styles.actionButton, ...styles.permanentButton }}
          onClick={() => onConvert(note, 'permanent')}
          title="Permanent Note に変換"
        >
          → Permanent
        </button>
        <button
          style={{ ...styles.actionButton, ...styles.deleteButton }}
          onClick={() => onDelete(note)}
          title="削除"
        >
          削除
        </button>
      </div>
    </li>
  );
}

const styles = {
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  item: {
    background: '#1e1e2e',
    border: '1px solid #313244',
    borderRadius: 6,
    padding: '10px 14px',
    cursor: 'default',
  },
  date: {
    display: 'block',
    fontSize: 11,
    color: '#6c7086',
    marginBottom: 4,
  },
  preview: {
    margin: '0 0 10px',
    fontSize: 14,
    color: '#cdd6f4',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  emptyNote: {
    color: '#45475a',
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
  actions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    border: 'none',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  literatureButton: {
    background: '#1e3a5f',
    color: '#89b4fa',
  },
  permanentButton: {
    background: '#1a3a25',
    color: '#a6e3a1',
  },
  deleteButton: {
    background: '#3a1a1e',
    color: '#f38ba8',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px 0',
    color: '#6c7086',
  },
  emptyText: {
    margin: 0,
    fontSize: 14,
    color: '#6c7086',
  },
  hint: {
    margin: '8px 0 0',
    fontSize: 12,
    color: '#45475a',
  },
} as const;
