const { remote, shell } = require('electron');
const { BrowserWindow } = remote;
const settings = require('electron-settings');
const { productName, version, description } = require('../package.json');

// hide activeWindow
const closeWindow = function () {
  const activeWindow = BrowserWindow.getFocusedWindow();
  activeWindow.hide();
}

window.addEventListener('load', async function () {
  
  // set package.json values to all dom the requires it
  document.getElementById('app-title').innerHTML = productName;
  document.getElementById('version').innerHTML = version;
  document.getElementById('app-description').innerHTML = description;

  // get settings openAtLogin, if not available, create a new one
  const openAtLoginSetting = await settings.get('openAtLogin') || true;
  document.getElementById('openAtLoginSetting').checked = openAtLoginSetting;
  await settings.set('openAtLogin', openAtLoginSetting);
  
  // if href is equivalent to [http, https, ftp] user electron shell
  const anchors = document.getElementsByTagName('a');
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (e) {
      const pattern = /^((http|https|ftp):\/\/)/;
      if (pattern.test(this.href)) {
        shell.openExternal(this.href);
      }
      e.preventDefault();
    });
  }
  
  // hide the window when the user press esc on their keyboard
  document.addEventListener('keydown', function (event) {
    const key = event || window.event;
    if (key.keyCode == 27) {
      closeWindow();
    }
  });
  
  // hide the window when the user click on close button
  document.getElementById('close').addEventListener('click', function (event) {
    event.preventDefault();
    closeWindow();
  });

  // start up settings on change event
  document.getElementById('openAtLoginSetting').addEventListener('change', async function () {
    const checkboxValue = document.getElementById('openAtLoginSetting').checked;
    await settings.set('openAtLogin', checkboxValue);
    remote.app.setLoginItemSettings({
      openAtLogin: openAtLoginSetting
    });
  });

});
