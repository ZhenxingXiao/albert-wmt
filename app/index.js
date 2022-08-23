const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const store = require('electron-store');
const log = require('electron-log');

/**
 * main process
 * process the logic of application
 */

const appKey = '31415926535897932384626433832795028841971693993751058209749445923';

// store
const store = new store({
    encryptionKey: appKey
});

// main window
let mainWindow;

// to create main window
let createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1028,
        height: 756,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`);
    isDev && mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => mainWindow = null);
}

let quit = () => {
    try{
        app.quit();
    }catch(e){
        log.error('Failed to quit application', e);
    }
}

app.on('ready', () => createWindow());

app.on('activate', () => {
    // Create a main window when application has been activated
    // and make sure the application is sigleton on Mac OS
    const allWin = BrowserWindow.getAllWindows();
    if(allWin.length === 0){
        createWindow();
    }else{
        allWin.map(win => {
            win.show();
        });
    }
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        quit();
    }
});

// to make sute the application is sigleton on Win OS
if(app.requestSingleInstanceLock()){
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        const allWin = BrowserWindow.getAllWindows();
        allWin.map(win => {
            win.show();
        });
    });
}else{
    quit();
}