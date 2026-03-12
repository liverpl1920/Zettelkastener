import { ipcMain, BrowserWindow } from 'electron';
import type { CreateNoteInput, IPCResult, Note, NoteType, PromoteInput } from '@shared/types';
import type { NoteService } from '../services/NoteService';
import { DatabaseError, NoteNotFoundError, InputValidationError } from '../services/NoteService';
import { logger } from '../utils/logger';

/**
 * ノート関連の IPC ハンドラーを登録する
 *
 * @param noteService - 依存する NoteService
 */
export function registerNoteHandlers(
  noteService: NoteService,
  getMainWindow: () => BrowserWindow | null
): void {
  // note:create — Fleeting Note を即保存（制約なし）
  ipcMain.handle('note:create', async (_event, input: CreateNoteInput): Promise<IPCResult<Note>> => {
    try {
      const note = noteService.create(input);
      // メインウィンドウに新規ノートをプッシュ通知する
      const mainWin = getMainWindow();
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.webContents.send('note:created', note);
      }
      return { success: true, data: note };
    } catch (error) {
      if (error instanceof DatabaseError) {
        logger.error('IPC note:create failed', { error: error.message });
        return { success: false, error: { code: error.code, message: error.message } };
      }
      logger.error('Unexpected error in note:create', { error });
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '予期しないエラーが発生しました' } };
    }
  });

  // note:getById — ID でノートを取得する
  ipcMain.handle(
    'note:getById',
    async (_event, { id }: { id: string }): Promise<IPCResult<Note | null>> => {
      try {
        const note = noteService.getById(id);
        return { success: true, data: note };
      } catch (error) {
        if (error instanceof DatabaseError) {
          logger.error('IPC note:getById failed', { error: error.message, id });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        logger.error('Unexpected error in note:getById', { error });
        return {
          success: false,
          error: { code: 'SYSTEM_ERROR', message: '予期しないエラーが発生しました' },
        };
      }
    }
  );

  // note:getByType — 種別でノート一覧を取得する
  ipcMain.handle(
    'note:getByType',
    async (_event, { type }: { type: NoteType }): Promise<IPCResult<Note[]>> => {
      try {
        const notes = noteService.getByType(type);
        return { success: true, data: notes };
      } catch (error) {
        if (error instanceof DatabaseError) {
          logger.error('IPC note:getByType failed', { error: error.message, type });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        logger.error('Unexpected error in note:getByType', { error });
        return {
          success: false,
          error: { code: 'SYSTEM_ERROR', message: '予期しないエラーが発生しました' },
        };
      }
    }
  );

  // note:delete — ノートを削除する
  ipcMain.handle(
    'note:delete',
    async (_event, { id }: { id: string }): Promise<IPCResult<void>> => {
      try {
        noteService.delete(id);
        return { success: true };
      } catch (error) {
        if (error instanceof NoteNotFoundError) {
          logger.error('IPC note:delete failed — not found', { error: error.message, id });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        if (error instanceof DatabaseError) {
          logger.error('IPC note:delete failed', { error: error.message, id });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        logger.error('Unexpected error in note:delete', { error });
        return { success: false, error: { code: 'SYSTEM_ERROR', message: '予期しないエラーが発生しました' } };
      }
    }
  );

  // note:promote — Fleeting Note を Literature / Permanent Note に昇格する
  ipcMain.handle(
    'note:promote',
    async (
      _event,
      {
        fleetingId,
        targetType,
        input,
      }: { fleetingId: string; targetType: 'literature' | 'permanent'; input: PromoteInput }
    ): Promise<IPCResult<Note>> => {
      try {
        const note = noteService.promote(fleetingId, targetType, input);
        return { success: true, data: note };
      } catch (error) {
        if (error instanceof NoteNotFoundError) {
          logger.error('IPC note:promote failed — not found', { error: error.message, fleetingId });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        if (error instanceof InputValidationError) {
          logger.error('IPC note:promote validation failed', { error: error.message, fleetingId });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        if (error instanceof DatabaseError) {
          logger.error('IPC note:promote failed', { error: error.message, fleetingId });
          return { success: false, error: { code: error.code, message: error.message } };
        }
        logger.error('Unexpected error in note:promote', { error });
        return { success: false, error: { code: 'SYSTEM_ERROR', message: '予期しないエラーが発生しました' } };
      }
    }
  );
}
