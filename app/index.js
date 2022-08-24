const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const log = require('electron-log');
const path = require('path');

const constants = require('./constants');

/**
 * main process
 * process the logic of application
 */

// store
const store = new Store({
    encryptionKey: constants.APP_KEY
});

// main window
let mainWindow;

// to create main window
let createWindow = () => {
    try{
        mainWindow = new BrowserWindow({
            width: 1028,
            height: 756,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        mainWindow.loadURL(isDev ? constants.DEV_URL : constants.PUB_URL);
        isDev && mainWindow.webContents.openDevTools();
        mainWindow.on('closed', () => mainWindow = null);

        ipcMain.on('to-main', (_, msg) => {console.log(msg)})
    }catch(e){
        log.error(constants.ERR_INFO.CREATE_MAIN_WIN, e);
    }
}

let quit = () => {
    try{
        app.quit();
    }catch(e){
        log.error(constants.ERR_INFO.QUITE_QPP, e);
    }
}

app.on('ready', () => {
    createWindow();
});

app.on('activate', () => {
    // Create a main window when application has been activated
    // and make sure the application is sigleton on Mac OS
    try{
        const allWin = BrowserWindow.getAllWindows();
        if(allWin.length === 0){
            createWindow();
        }else{
            allWin.map(win => {
                win.show();
            });
        }
    }catch(e){
        log.error(constants.ERR_INFO.GET_ALL_WIN, e);
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
        try{
            const allWin = BrowserWindow.getAllWindows();
            allWin.map(win => {
                win.show();
            });
        }catch(e){
            log.error(constants.ERR_INFO.GET_ALL_WIN, e);
        }
    });
}else{
    quit();
}