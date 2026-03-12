import { contextBridge, ipcRenderer } from 'electron';
import type { CreateNoteInput, IPCResult, Note, NoteType, PromoteInput } from '@shared/types';

// Renderer Process から安全に Main Process を呼び出す API を公開する
contextBridge.exposeInMainWorld('api', {
  notes: {
    /**
     * ノートを作成する
     *
     * @param input - ノート作成入力
     * @returns IPCResult<Note>
     */
    create: (input: CreateNoteInput): Promise<IPCResult<Note>> =>
      ipcRenderer.invoke('note:create', input),

    /**
     * ID でノートを取得する
     *
     * @param id - ノートの UUID
     * @returns IPCResult<Note | null>
     */
    getById: (id: string): Promise<IPCResult<Note | null>> =>
      ipcRenderer.invoke('note:getById', { id }),

    /**
     * 種別でノート一覧を取得する
     *
     * @param type - ノート種別
     * @returns IPCResult<Note[]>
     */
    getByType: (type: NoteType): Promise<IPCResult<Note[]>> =>
      ipcRenderer.invoke('note:getByType', { type }),

    /**
     * ノートが作成されたときのイベントを購読する
     * Main Process からプッシュされる（クイックキャプチャで保存後にメイン画面を更新するため）
     *
     * @param callback - 作成された Note を受け取るコールバック
     * @returns 購読解除関数
     */
    onCreated: (callback: (note: Note) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, note: Note): void => callback(note);
      ipcRenderer.on('note:created', handler);
      return (): void => {
        ipcRenderer.removeListener('note:created', handler);
      };
    },

    /**
     * ノートを削除する
     *
     * @param id - 削除するノートの UUID
     * @returns IPCResult<void>
     */
    delete: (id: string): Promise<IPCResult<void>> =>
      ipcRenderer.invoke('note:delete', { id }),

    /**
     * Fleeting Note を Literature / Permanent Note に昇格する
     *
     * @param fleetingId - Fleeting Note UUID
     * @param targetType - 昇格先種別
     * @param input - 昇格入力
     * @returns IPCResult<Note>
     */
    promote: (
      fleetingId: string,
      targetType: 'literature' | 'permanent',
      input: PromoteInput
    ): Promise<IPCResult<Note>> =>
      ipcRenderer.invoke('note:promote', { fleetingId, targetType, input }),
  },
  window: {
    /**
     * クイックキャプチャウィンドウを閉じる
     */
    closeQuickCapture: (): void => ipcRenderer.send('window:closeQuickCapture'),
  },
});

// TypeScript 向けの型宣言（renderer で import せずに window.api として使える）
export {};
