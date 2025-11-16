import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { getCache } from './database-file.js';

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
});

ipcMain.handle('cache:has', async (_event, date: string, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    const trimmedToken = apiToken.trim();
    return cache.hasCache(date, trimmedToken);
  } catch (error) {
    return false;
  }
});

ipcMain.handle('cache:get', async (_event, date: string, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    const trimmedToken = apiToken.trim();
    return cache.getCache(date, trimmedToken);
  } catch (error) {
    return null;
  }
});
ipcMain.handle('cache:set', async (_event, date: string, apiToken: string, data: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    const trimmedToken = apiToken.trim();
    cache.setCache(date, trimmedToken, data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cache:isPastDate', async (_event, date: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    return cache.isPastDate(date);
  } catch (error) {
    return false;
  }
});

ipcMain.handle('cache:getAllDates', async (_event, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    return cache.getAllCachedDates(apiToken);
  } catch (error) {
    return [];
  }
});

ipcMain.handle('cache:delete', async (_event, date: string, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    cache.deleteCache(date, apiToken);
  } catch (error) {
    // Ignore errors
  }
});

ipcMain.handle('cache:clearAll', async (_event, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    cache.clearAllCache(apiToken);
  } catch (error) {
    // Ignore errors
  }
});

ipcMain.handle('cache:getStats', async (_event, apiToken: string) => {
  if (!cache) {
    cache = getCache();
  }
  try {
    return cache.getCacheStats(apiToken);
  } catch (error) {
    return { totalEntries: 0, oldestDate: null, newestDate: null };
  }
});

ipcMain.handle('cache:listAll', async () => {
  if (!cache) {
    cache = getCache();
  }
  try {
    return cache.listAllCacheEntries();
  } catch (error) {
    return [];
  }
});

app.on('before-quit', () => {
  if (cache) {
    cache.close();
  }
});

app.whenReady().then(createWindow);

