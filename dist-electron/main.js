import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, '../public');
let win = null;
const preload = path.join(__dirname, 'preload.js');
const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
function createWindow() {
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
    }
    else {
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
app.whenReady().then(createWindow);
