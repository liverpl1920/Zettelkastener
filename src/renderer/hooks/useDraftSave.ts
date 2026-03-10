import { useEffect } from 'react';

const DRAFT_KEY = 'draft_new';
const SAVE_INTERVAL_MS = 30_000; // 30秒ごとに自動保存

/**
 * 入力中のコンテンツを localStorage に定期保存するカスタム Hook
 *
 * @param content - 保存対象の文字列
 * @param onRestored - 起動時にドラフトが見つかった場合に呼ばれるコールバック
 */
export function useDraftSave(
  content: string,
  onRestored: (savedContent: string) => void
): { clearDraft: () => void } {
  // マウント時: 未保存ドラフトがあれば復元を提案する
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const { content: savedContent } = JSON.parse(saved) as { content: string };
        if (savedContent.trim().length > 0) {
          onRestored(savedContent);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回マウント時のみ実行

  // content が変わるたびに 30 秒タイマーをリセットして保存
  useEffect(() => {
    if (content.trim().length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, savedAt: new Date().toISOString() }));
    }, SAVE_INTERVAL_MS);

    return (): void => {
      clearTimeout(timer);
    };
  }, [content]);

  const clearDraft = (): void => {
    localStorage.removeItem(DRAFT_KEY);
  };

  return { clearDraft };
}
