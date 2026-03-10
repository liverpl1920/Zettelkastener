import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { getDatabase } from './db/database';
import { NoteRepository } from './repositories/NoteRepository';
import { NoteService } from './services/NoteService';
import { registerNoteHandlers } from './ipc/NoteHandlers';
import { openQuickCaptureWindow, closeQuickCaptureWindow } from './windows/quickCapture';
import { logger } from './utils/logger';

// メインウィンドウ（ホーム画面）
let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function setupGlobalShortcuts(): void {
  const preloadPath = join(__dirname, '../preload/index.js');

  // グローバルショートカット: Ctrl+Shift+N でクイックキャプチャを開く
  const registered = globalShortcut.register('CommandOrControl+Shift+N', () => {
    logger.info('Quick capture shortcut triggered');
    openQuickCaptureWindow(preloadPath);
  });

  if (!registered) {
    logger.warn('Failed to register global shortcut CommandOrControl+Shift+N');
  }
}

function initializeServices(): {
  noteService: NoteService;
} {
  const db = getDatabase();
  const noteRepository = new NoteRepository(db);
  const noteService = new NoteService(noteRepository);
  return { noteService };
}

// メインウィンドウを閉じてもアプリを終了しない（macOS 慣習）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// アプリ終了時にショートカットを解除する
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC: ウィンドウ制御
ipcMain.on('window:closeQuickCapture', () => {
  closeQuickCaptureWindow();
});

// アプリ起動
app.whenReady().then(() => {
  logger.info('App starting');

  const { noteService } = initializeServices();
  registerNoteHandlers(noteService, getMainWindow);
  setupGlobalShortcuts();
  createMainWindow();

  logger.info('App started');
});
