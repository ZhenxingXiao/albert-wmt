const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

let createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1028,
        height: 756,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`);
    isDev && mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', () => createWindow());

app.on('activate', () => {if(mainWindow === null) createWindow();});

app.on('window-all-closed', () => {if(process.platform !== 'darwin') app.quit();});
