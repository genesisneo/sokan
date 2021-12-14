const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  Tray,
  ipcMain,
} = require('electron');
const path = require('path');
const settings = require('electron-settings');
const {
  productName,
  version
} = require('./package.json');
const windowControl = require('./module.js');
const isDevelopment = process?.env?.NODE_ENV?.trim() === 'development';

// electron ready
app.on('ready', async function () {

  if (!isDevelopment) {
    // get settings openAtLogin, if not available, create a new one
    const openAtLoginSetting = await settings.get('openAtLogin') ?? true;
    await settings.set('openAtLogin', openAtLoginSetting);

    // set electron login settings
    const appName = path.basename(process?.env?.PORTABLE_EXECUTABLE_FILE || process?.execPath);
    const appPath = process?.env?.PORTABLE_EXECUTABLE_FILE || path.resolve('.', appName);
    app.setLoginItemSettings({
      name: productName,
      openAtLogin: openAtLoginSetting,
      openAsHidden: true,
      path: appPath
    });
  }

  // BrowserWindow
  const window = new BrowserWindow({
    width: 360,
    height: 360,
    alwaysOnTop: true,
    center: true,
    frame: false,
    icon: path.join(__dirname, 'assets/icons/application.ico'),
    minimizable: false,
    maximizable: false,
    movable: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    transparent: true,
    title: productName,
    webPreferences: {
      preload: path.join(__dirname, 'pages/preload.js')
    }
  });
  window.loadFile( path.join(__dirname, 'pages/about.html'));

  // BrowserWindow events
  window.on('blur', function () {
    window.hide();
  });
  window.on('show', function () {
    // prevent BrowserWindow to flick
    setTimeout(function () {
      window.setOpacity(1);
    }, 125);
  });
  window.on('hide', function () {
    // prevent BrowserWindow to flick
    setTimeout(function () {
      window.setOpacity(0);
    }, 125);
  });
  window.on('will-quit', function () {
    globalShortcut.unregisterAll();
  });

  // systemTray
  const tray = new Tray(__dirname + '/assets/icons/application.ico');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Upper Right',
      type: 'normal',
      accelerator: 'Alt+Ctrl+9',
      icon: __dirname + '/assets/icons/icon-upper-right.png',
      enabled: false,
    },
    {
      label: 'Upper Half',
      type: 'normal',
      accelerator: 'Alt+Ctrl+8',
      icon: __dirname + '/assets/icons/icon-upper-half.png',
      enabled: false,
    },
    {
      label: 'Upper Left',
      type: 'normal',
      accelerator: 'Alt+Ctrl+7',
      icon: __dirname + '/assets/icons/icon-upper-left.png',
      enabled: false,
    },
    {
      type: 'separator',
    },
    {
      label: 'Half Right',
      type: 'normal',
      accelerator: 'Alt+Ctrl+6',
      icon: __dirname + '/assets/icons/icon-half-right.png',
      enabled: false,
    },
    {
      label: 'Center',
      type: 'normal',
      accelerator: 'Alt+Ctrl+5',
      icon: __dirname + '/assets/icons/icon-center.png',
      enabled: false,
    },
    {
      label: 'Half Left',
      type: 'normal',
      accelerator: 'Alt+Ctrl+4',
      icon: __dirname + '/assets/icons/icon-half-left.png',
      enabled: false,
    },
    {
      type: 'separator',
    },
    {
      label: 'Lower Right',
      type: 'normal',
      accelerator: 'Alt+Ctrl+3',
      icon: __dirname + '/assets/icons/icon-lower-right.png',
      enabled: false,
    },
    {
      label: 'Lower Half',
      type: 'normal',
      accelerator: 'Alt+Ctrl+2',
      icon: __dirname + '/assets/icons/icon-lower-half.png',
      enabled: false,
    },
    {
      label: 'Lower Left',
      type: 'normal',
      accelerator: 'Alt+Ctrl+1',
      icon: __dirname + '/assets/icons/icon-lower-left.png',
      enabled: false,
    },
    {
      type: 'separator',
    },
    {
      label: 'About ',
      type: 'normal',
      click: function () {
        // show BrowserWindow
        window.show();
      },
    },
    {
      label: 'Quit',
      type: 'normal',
      click: function () {
        app.quit();
      },
    },
  ]);
  tray.setToolTip(productName + ' v ' + version);
  tray.setContextMenu(contextMenu);
  tray.on('click', function () {
    tray.popUpContextMenu();
  });

  // globalShortcut numerical keys and numerical pads
  globalShortcut.registerAll(
    ['Alt+Ctrl+9', 'Alt+Ctrl+num9'],
    function () {
      windowControl('ur');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+8', 'Alt+Ctrl+num8'],
    function () {
      windowControl('uh');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+7', 'Alt+Ctrl+num7'],
    function () {
      windowControl('ul');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+6', 'Alt+Ctrl+num6'],
    function () {
      windowControl('hr');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+5', 'Alt+Ctrl+num5'],
    function () {
      windowControl('c');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+4', 'Alt+Ctrl+num4'],
    function () {
      windowControl('hl');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+3', 'Alt+Ctrl+num3'],
    function () {
      windowControl('lr');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+2', 'Alt+Ctrl+num2'],
    function () {
      windowControl('lh');
    });
  globalShortcut.registerAll(
    ['Alt+Ctrl+1', 'Alt+Ctrl+num1'],
    function () {
      windowControl('ll');
    });

  // handle window controls via ipc
  ipcMain.on('hideActiveWindow', function () {
    window.hide();
  });
  ipcMain.handle('getLoginSettings', function (event, key) {
    return settings.get(key) ?? true;
  });
  ipcMain.on('setLoginSettings', async function (event, key, value) {
    await settings.set(key, value);
    app.setLoginItemSettings({
      [key]: value
    });
  });

});
