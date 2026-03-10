import React, { useState } from 'react';
import type { Note } from '@shared/types';
import { useNoteStore } from '../../stores/useNoteStore';

interface ConvertNoteModalProps {
  note: Note;
  targetType: 'literature' | 'permanent';
  onClose: () => void;
}

/**
 * Fleeting Note 変換モーダル
 *
 * - Literature Note への変換: 出典タグ入力（@author:等）を必須とする
 * - Permanent Note への変換: 本文書き直し（リンクは後続 Step3 で実装）
 */
export function ConvertNoteModal({
  note,
  targetType,
  onClose,
}: ConvertNoteModalProps): React.ReactElement {
  const [content, setContent] = useState(note.content);
  const [sourceTagsText, setSourceTagsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertNote = useNoteStore((state) => state.upsertNote);
  const removeNote = useNoteStore((state) => state.removeNote);

  const targetLabel = targetType === 'literature' ? 'Literature Note' : 'Permanent Note';

  const handleConvert = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const sourceTagTexts =
        targetType === 'literature'
          ? sourceTagsText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const result = await window.api.notes.promote(note.id, targetType, {
        content,
        sourceTagTexts,
      });

      if (!result.success || !result.data) {
        setError(result.error?.message ?? '変換に失敗しました');
        return;
      }

      // ストアを更新: 元の Fleeting Note を削除し、変換後のノートを追加する
      removeNote(note.id);
      upsertNote(result.data);
      onClose();
    } catch {
      setError('変換中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <h2 style={styles.title}>{targetLabel} に変換</h2>

        <label style={styles.label} htmlFor="convert-content">
          本文
        </label>
        <textarea
          id="convert-content"
          style={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="本文を書き直せます（省略時は元の内容を引き継ぎます）"
        />

        {targetType === 'literature' && (
          <>
            <label style={styles.label} htmlFor="convert-source-tags">
              出典タグ
              <span style={styles.required}>（必須）</span>
            </label>
            <p style={styles.hint}>
              1行に1タグ。例: <code style={styles.code}>@author:Ahrens</code>{' '}
              <code style={styles.code}>@title:How to Take Smart Notes</code>
            </p>
            <textarea
              id="convert-source-tags"
              style={styles.textareaSmall}
              value={sourceTagsText}
              onChange={(e) => setSourceTagsText(e.target.value)}
              rows={4}
              placeholder={'@author:著者名\n@title:タイトル\n@url:https://example.com'}
            />
          </>
        )}

        {targetType === 'permanent' && (
          <p style={styles.infoText}>
            ※ リンクの追加は後続フェーズで実装予定です。現在は変換のみ行われます。
          </p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose} disabled={isLoading}>
            キャンセル
          </button>
          <button
            style={isLoading ? { ...styles.convertButton, opacity: 0.6 } : styles.convertButton}
            onClick={handleConvert}
            disabled={isLoading}
          >
            {isLoading ? '変換中...' : `${targetLabel} に変換`}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1e1e2e',
    border: '1px solid #313244',
    borderRadius: 8,
    padding: '24px 28px',
    width: 520,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#cdd6f4',
  },
  label: {
    fontSize: 13,
    color: '#a6adc8',
    fontWeight: 600,
  },
  required: {
    marginLeft: 6,
    fontSize: 11,
    color: '#f38ba8',
    fontWeight: 400,
  },
  hint: {
    margin: '0',
    fontSize: 12,
    color: '#6c7086',
    lineHeight: 1.5,
  },
  code: {
    background: '#313244',
    borderRadius: 3,
    padding: '1px 4px',
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#89b4fa',
  },
  textarea: {
    width: '100%',
    background: '#181825',
    border: '1px solid #313244',
    borderRadius: 6,
    color: '#cdd6f4',
    fontSize: 14,
    fontFamily: 'inherit',
    padding: '10px 12px',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  textareaSmall: {
    width: '100%',
    background: '#181825',
    border: '1px solid #313244',
    borderRadius: 6,
    color: '#cdd6f4',
    fontSize: 13,
    fontFamily: 'monospace',
    padding: '10px 12px',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  infoText: {
    margin: 0,
    fontSize: 12,
    color: '#6c7086',
    fontStyle: 'italic' as const,
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: '#f38ba8',
    background: '#2a1a1e',
    border: '1px solid #f38ba8',
    borderRadius: 6,
    padding: '8px 12px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    background: 'transparent',
    border: '1px solid #45475a',
    borderRadius: 6,
    color: '#cdd6f4',
    fontSize: 13,
    padding: '7px 16px',
    cursor: 'pointer',
  },
  convertButton: {
    background: '#89b4fa',
    border: 'none',
    borderRadius: 6,
    color: '#1e1e2e',
    fontSize: 13,
    fontWeight: 700,
    padding: '7px 16px',
    cursor: 'pointer',
  },
} as const;
