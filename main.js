const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipcMain       = electron.ipcMain;
const net           = electron.net;
const path          = require('path');
const url           = require('url');

ipcMain.on('async-download-start', (event, taskId, url) => {
    request = net.request(url);
    request.on('response', (response) => {
        let buffers = [],
            totalLength = 0;
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            buffers.push(chunk);
            totalLength += chunk.length;
        });
        response.on('end', () => {
            console.log('send finish event');
            let buf = Buffer.concat(buffers, totalLength);
            event.sender.send('async-download-finish', taskId, buf);
        });
    });
    request.end();
});
ipcMain.on('async-requestUse-start', (event, taskId, url) => {
    requestUse = net.request({
        method: 'POST',
        protocol: 'https:',
        hostname: 'www.moem.cc',
        port: 443,
        path: '/software/MMT163/' + url
    });
    requestUse.on('response', (response) => {
        let buffers = [],
            totalLength = 0;
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            buffers.push(chunk);
            totalLength += chunk.length;
        });
        response.on('end', () => {
            console.log('send finish event');
            let buf = Buffer.concat(buffers, totalLength);
            event.sender.send('async-requestUse-finish', taskId, buf);
        });
    });
    requestUse.end();
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const requestLaunch = net.request({
        method: 'POST',
        protocol: 'https:',
        hostname: 'www.moem.cc',
        port: 443,
        path: '/software/MMT163/launch'
    });
    requestLaunch.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        response.on('end', () => {
            console.log('No more data in response.');
        });
    });
    requestLaunch.end();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width           : 1000,
        height          : 700,
        resizable       : false,
        title           : '网易云工具',
        autoHideMenuBar : true,
        webPreferences  : {
            preload         : path.resolve(__dirname, './preload.js'),
            nodeIntegration : false,
            webSecurity     : false
        },
    });
    mainWindow.setTitle(require('./package.json').name);

    // and load the index.html of the app.
    mainWindow.loadURL('http://music.163.com/#/search/m/?s=');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    const {
        app,
        Menu
    } = require('electron');
    const template = [{
        label: '软件',
        submenu: [{
                label: '关于',
                click() {
                    require('electron').shell.openExternal('http://www.moem.cc');
                },
            },
            {
                label: '退出',
                click: function() {
                    app.quit();
                },
            },
        ],
    }, ];
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [{
                role: 'about',
            }, {
                type: 'separator',
            }, {
                role: 'services',
                submenu: [],
            }, {
                type: 'separator',
            }, {
                role: 'hide',
            }, {
                role: 'hideothers',
            }, {
                role: 'unhide',
            }, {
                type: 'separator',
            }, {
                role: 'quit',
            }, ],
        });
    }

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.