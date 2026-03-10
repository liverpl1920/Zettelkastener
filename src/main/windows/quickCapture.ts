import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

let quickCaptureWindow: BrowserWindow | null = null;

/**
 * クイックキャプチャウィンドウを作成し最前面に表示する
 *
 * @param preloadPath - preload スクリプトのパス
 */
export function openQuickCaptureWindow(preloadPath: string): void {
  // 既にウィンドウが存在する場合は前面表示のみ
  if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
    quickCaptureWindow.focus();
    return;
  }

  quickCaptureWindow = new BrowserWindow({
    width: 480,
    height: 220,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    transparent: false,
    show: false, // ロード完了後に表示する（ちらつき防止）
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // ロード完了後に表示（1秒以内表示保証のため、ready-to-show を使用）
  quickCaptureWindow.once('ready-to-show', () => {
    quickCaptureWindow?.show();
    quickCaptureWindow?.webContents.focus();
  });

  // 外部リンクはデフォルトブラウザで開く
  quickCaptureWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // 開発環境: Vite dev server の /?mode=capture を読み込む
    quickCaptureWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=capture`);
  } else {
    // 本番環境: バンドルされた HTML を読み込む（クエリパラメータ付き）
    quickCaptureWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { mode: 'capture' },
    });
  }
}

/**
 * クイックキャプチャウィンドウを閉じる
 */
export function closeQuickCaptureWindow(): void {
  if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
    quickCaptureWindow.close();
    quickCaptureWindow = null;
  }
}
