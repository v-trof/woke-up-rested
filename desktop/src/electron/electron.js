/* eslint-disable @typescript-eslint/no-var-requires */
const { app, session, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { startAlarmInterval } = require('./sync');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        title: 'Full time sleep',
        titleBarStyle: 'hidden',
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'electron-preload.js'),
            nativeWindowOpen: true,
            nodeIntegration: true,
        },
    });

    win.setMenu(null);

    if (isDev) {
        win.loadURL('http://localhost:1234', { userAgent: 'Chrome' });
    } else {
        win.loadFile(path.join(__dirname, 'index.html'));
    }

    let disposeInterval = () => 0;
    ipcMain.on('userToken', (_, token) => {
        console.log('token', token);
        disposeInterval();
        disposeInterval = startAlarmInterval(token);
    });

    win.on('closed', () => (mainWindow = null));
}

app.userAgentFallback = 'Chrome';

app.whenReady().then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = 'Chrome';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
