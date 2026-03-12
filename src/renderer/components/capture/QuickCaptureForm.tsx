import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDraftSave } from '../../hooks/useDraftSave';
import { useNoteStore } from '../../stores/useNoteStore';

interface ToastState {
  message: string;
  type: 'error' | 'success';
}

/**
 * クイックキャプチャフォームコンポーネント
 *
 * - Ctrl+Enter で Fleeting Note として即保存
 * - Esc で破棄してウィンドウを閉じる
 * - 起動から書き始めるまで 1 秒以内（textarea にオートフォーカス）
 */
export function QuickCaptureForm(): React.ReactElement {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const upsertNote = useNoteStore((state) => state.upsertNote);

  const showToast = (message: string, type: ToastState['type']): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ドラフト保存・復元フック
  const { clearDraft } = useDraftSave(content, (savedContent) => {
    // 既存ドラフトがあれば内容を復元する（確認なしで復元：クイックキャプチャは常に上書き可）
    setContent(savedContent);
  });

  // マウント時にテキストエリアにフォーカス（1秒以内表示の核心）
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    try {
      const result = await window.api.notes.create({
        type: 'fleeting',
        content: content.trim(),
      });

      if (result.success && result.data) {
        upsertNote(result.data);
        clearDraft();
        window.api.window.closeQuickCapture();
      } else {
        // 保存失敗: エラートーストを表示（入力内容は保持）
        showToast(
          result.error?.message ?? '保存に失敗しました。もう一度お試しください。',
          'error'
        );
        // ドラフトとして即時保存しておく
        localStorage.setItem(
          'draft_new',
          JSON.stringify({ content: content.trim(), savedAt: new Date().toISOString() })
        );
      }
    } catch {
      showToast('保存に失敗しました。もう一度お試しください。', 'error');
      localStorage.setItem(
        'draft_new',
        JSON.stringify({ content: content.trim(), savedAt: new Date().toISOString() })
      );
    } finally {
      setIsSaving(false);
    }
  }, [content, isSaving, clearDraft, upsertNote]);

  const handleDiscard = useCallback((): void => {
    clearDraft();
    window.api.window.closeQuickCapture();
  }, [clearDraft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDiscard();
      }
    },
    [handleSave, handleDiscard]
  );

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <span style={styles.badge}>Fleeting Note</span>
        <span style={styles.hint}>Ctrl+Enter: 保存 / Esc: 破棄</span>
      </div>

      {/* テキストエリア */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="今、思っていることを書いてください..."
        disabled={isSaving}
        style={styles.textarea}
        aria-label="クイックキャプチャ入力エリア"
      />

      {/* トースト通知 */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            ...styles.toast,
            backgroundColor: toast.type === 'error' ? '#dc2626' : '#16a34a',
          }}
          data-testid="toast-notification"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    padding: '8px',
    fontFamily: "'Noto Sans CJK JP', 'Noto Sans JP', system-ui, -apple-system, sans-serif",
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#f59e0b',
    color: '#000',
    fontWeight: 'bold' as const,
  },
  hint: {
    fontSize: '11px',
    color: '#6b7280',
  },
  textarea: {
    flex: 1,
    resize: 'none' as const,
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'inherit',
    backgroundColor: '#111827',
    color: '#f3f4f6',
    outline: 'none',
  },
  toast: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    right: '12px',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#fff',
    textAlign: 'center' as const,
  },
} as const;
