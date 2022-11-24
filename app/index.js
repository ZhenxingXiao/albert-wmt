const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
// const Store = require('electron-store');
const log = require('electron-log');
const path = require('path');
const { NgReferAnalysisParser, NgReferAnalysisCallback } = require('./refer-parser');
const constants = require('./constants');
const fs = require('fs');
const { REFER_ANALYSIS, REFER_ANALYSIS_GRAPH } = require('channels');
const { DIALOG } = require('channels');
const { DialogType } = require('channels');
const Realm = require('realm');
const { NodeSchema, LinkSchema, SubLinkSchema, LocSchema } = require('./data-schema');
const { InsertGraph, DeleteAllObjects } = require('./database');

/**
 * main process
 * process the logic of application
 */

// store
// const store = new Store({
//     encryptionKey: constants.APP_KEY
// });
var globalRealm;

const initGlobalRealmClient = async () => {
    try {
        //const realmApp = new Realm.App({ id: constants.APP_ID });
        //await realmApp.logIn(Realm.Credentials.anonymous());
        globalRealm = await Realm.open({
            path:'albert-wmt-db.realm',
            schema: [NodeSchema, LinkSchema, SubLinkSchema, LocSchema],
            // sync: {
            //     user: realmApp.currentUser,
            //     partitionValue: 'myPartition',
            // },
        });
    } catch (err) {
        log.error(constants.ERR_INFO.FAILED_OPEN_REALM, err)
    }
}

const initNgReferAnalysisParser = (_mainWindow) => {
    try{
        const cacheDir = path.join(
            app.getPath(constants.APP_DATA_DIR_KEY), 
            app.getName(),
            constants.DATA_CACHE_DIR
        );
        if (!fs.existsSync(cacheDir)){
            fs.mkdirSync(cacheDir);
        }
        const ngReferAnalysisCallback = new NgReferAnalysisCallback(_mainWindow);
        const ngReferAnalysisParser = new NgReferAnalysisParser(cacheDir);
        ipcMain.on(REFER_ANALYSIS, (_, msg) => {
            ngReferAnalysisParser.parse(JSON.parse(msg), ngReferAnalysisCallback.callback);
            if(globalRealm){
                DeleteAllObjects(globalRealm);
                InsertGraph(globalRealm, ngReferAnalysisParser.graph);
            }
            _mainWindow.webContents.send(REFER_ANALYSIS_GRAPH, JSON.stringify(ngReferAnalysisParser.graph));
        });
    }catch(e){
        log.error(constants.ERR_INFO.INIT_NG_REFER_PARSER, e);
    }
}

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

        if(mainWindow.webContents.isDevToolsOpened()){
            mainWindow.webContents.closeDevTools();
        }
        isDev && mainWindow.webContents.openDevTools();

        mainWindow.on('closed', () => mainWindow = null);

        initNgReferAnalysisParser(mainWindow);

        ipcMain.on(DIALOG, (_, type) => {
            let resultPath = '';
            switch(type){
                case DialogType.DirectoryDialog:
                    resultPath = dialog.showOpenDialogSync(mainWindow, {properties: ['openDirectory']});
                    break;
                case DialogType.FileDialog:
                    resultPath = dialog.showSaveDialogSync(mainWindow, {
                        filters: [
                            {
                                name: 'graph and AST data package',
                                extensions: ['gastd']
                            }
                        ]
                    });
                    break;
                default:
                    break;
            }
            mainWindow.webContents.send(DIALOG, JSON.stringify({
                type: type,
                path: resultPath
            }));
        });
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

app.whenReady().then(async () =>{
    await initGlobalRealmClient();
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