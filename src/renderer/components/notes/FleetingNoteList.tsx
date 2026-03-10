import React, { useEffect, useState } from 'react';
import type { Note } from '@shared/types';
import { useNoteStore } from '../../stores/useNoteStore';

/**
 * Fleeting Note 一覧コンポーネント
 *
 * - マウント時に IPC 経由で Fleeting Note をすべて取得して表示する
 * - クイックキャプチャで保存した新しいノートは note:created イベントで即座に反映される
 */
export function FleetingNoteList(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const upsertNote = useNoteStore((state) => state.upsertNote);
  const upsertNotes = useNoteStore((state) => state.upsertNotes);
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
    <ul style={styles.list} aria-label="Fleeting Note 一覧">
      {notes.map((note) => (
        <FleetingNoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}

function FleetingNoteItem({ note }: { note: Note }): React.ReactElement {
  const preview = note.content.length > 100 ? note.content.slice(0, 100) + '…' : note.content;
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
      <p style={styles.preview}>{preview || <em style={styles.empty}>（内容なし）</em>}</p>
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
    margin: 0,
    fontSize: 14,
    color: '#cdd6f4',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
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
