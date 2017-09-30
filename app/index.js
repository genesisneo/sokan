
// variables
var tray = null,
    electron = require('electron'),
    package = require('../package.json'),
    windowControl = require('./window-control.js'),
    {app, BrowserWindow, globalShortcut, Menu, Tray} = electron;

// electron ready
app.on('ready', function() {

    // BrowserWindow
    var window = new BrowserWindow({
        width: 360,
        height: 360,
        alwaysOnTop: true,
        center: true,
        frame: false,
        icon: __dirname + '/assets/icons/application.ico',
        minimizable: false,
        maximizable: false,
        movable: false,
        resizable: false,
        show: false,
        skipTaskbar: true,
        transparent: true,
        title: package.productName
    });
    window.loadURL(`file://${__dirname}/about.html`);

    // BrowserWindow events
    window.on('blur',  function() {
        window.hide();
    });

    // systemTray
    tray = new Tray(__dirname + '/assets/icons/application.ico');
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Upper Left',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+7',
            icon: __dirname + '/assets/icons/icon-upper-left.png'
        },
        {
            label: 'Upper Half',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+8',
            icon: __dirname + '/assets/icons/icon-upper-half.png'
        },
        {
            label: 'Upper Right',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+9',
            icon: __dirname + '/assets/icons/icon-upper-right.png'
        },
        {
            type: 'separator'
        },
        {
            label: 'Half Left',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+4',
            icon: __dirname + '/assets/icons/icon-half-left.png'
        },
        {
            label: 'Center',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+5',
            icon: __dirname + '/assets/icons/icon-center.png'
        },
        {
            label: 'Half Right',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+6',
            icon: __dirname + '/assets/icons/icon-half-right.png'
        },
        {
            type: 'separator'
        },
        {
            label: 'Lower Left',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+1',
            icon: __dirname + '/assets/icons/icon-lower-left.png'
        },
        {
            label: 'Lower Half',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+2',
            icon: __dirname + '/assets/icons/icon-lower-half.png'
        },
        {
            label: 'Lower Right',
            type: 'normal',
            accelerator: 'CommandOrControl+Shift+3',
            icon: __dirname + '/assets/icons/icon-lower-right.png'
        },
        {
            type: 'separator'
        },
        {
            label: 'About ',
            type: 'normal',
            icon: __dirname + '/assets/icons/application.png',
            click: function() {
                // show BrowserWindow
                window.show();
            }
        },
        {
            label: 'Quit',
            type: 'normal',
            click: function() {
                app.quit();
            }
        },
    ]);
    tray.setToolTip(package.productName + ' v ' + package.version);
    tray.setContextMenu(contextMenu);

    // globalShortcut
    globalShortcut.register('CommandOrControl+Shift+7', function() {
        windowControl.windowControl('ul');
    });
    globalShortcut.register('CommandOrControl+Shift+8', function() {
        windowControl.windowControl('uh');
    });
    globalShortcut.register('CommandOrControl+Shift+9', function() {
        windowControl.windowControl('ur');
    });
    globalShortcut.register('CommandOrControl+Shift+4', function() {
        windowControl.windowControl('hl');
    });
    globalShortcut.register('CommandOrControl+Shift+5', function() {
        windowControl.windowControl('c');
    });
    globalShortcut.register('CommandOrControl+Shift+6', function() {
        windowControl.windowControl('hr');
    });
    globalShortcut.register('CommandOrControl+Shift+1', function() {
        windowControl.windowControl('ll');
    });
    globalShortcut.register('CommandOrControl+Shift+2', function() {
        windowControl.windowControl('lh');
    });
    globalShortcut.register('CommandOrControl+Shift+3', function() {
        windowControl.windowControl('lr');
    });

});
