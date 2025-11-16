import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { getCache } from './database-file.js';
import { registerCacheHandlers } from './utils/ipc-handlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, 'preload.js');
const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function createWindow(): void {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (!app.isPackaged && url) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST || __dirname, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let cache: ReturnType<typeof getCache> | null = null;

app.whenReady().then(() => {
  cache = getCache();
  if (cache) {
    registerCacheHandlers(cache);
  }
});

app.on('before-quit', () => {
  if (cache) {
    cache.close();
  }
});

app.whenReady().then(createWindow);

