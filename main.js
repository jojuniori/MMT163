/*jshint -W104*/
const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    // width: 1000,
    height: 700,
    resizable: false,
    title: '网易萌工具',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.resolve(__dirname, './preload.js'),
    },
  });
  mainWindow.setTitle(require('./package.json').name);

  // and load the index.html of the app.
  mainWindow.loadURL('http://music.163.com/#/search/m/?s=');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  //
  // prefsWindow = new BrowserWindow({width: 400, height: 400})
  // prefsWindow.loadURL('http://music.163.com/#/search/m/?s=')

  const { app, Menu } = require('electron');
  const template = [
    {
      label: '软件',
      submenu: [
        {
          label: '关于',
          click() { require('electron').shell.openExternal('http://www.moem.cc'); },
        },
        {
          label: '退出',
          click: function () { app.quit(); },
        },
      ],
    },
  ];
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          role: 'about',
        },
        {
          type: 'separator',
        },
        {
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          role: 'hide',
        },
        {
          role: 'hideothers',
        },
        {
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
        },
      ],
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
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
