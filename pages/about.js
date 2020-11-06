const { remote, shell } = require('electron');
const { BrowserWindow } = remote;
const { productName, version, description } = require('../package.json');

// hide activeWindow
const closeWindow = function () {
  const activeWindow = BrowserWindow.getFocusedWindow();
  activeWindow.hide();
}

window.addEventListener('load', function () {
  
  // set package.json values to all dom the requires it
  document.getElementById('app-title').innerHTML = productName;
  document.getElementById('version').innerHTML = version;
  document.getElementById('app-description').innerHTML = description;
  
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

});
