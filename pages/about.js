window.addEventListener('load', async function () {

  const {
    productName,
    version,
    description,
    shell,
    hideActiveWindow,
    getLoginSettings,
    setLoginSettings
  } = window.sokan;
  
  // set values to all dom the requires it
  document.getElementById('app-title').innerHTML = productName;
  document.getElementById('version').innerHTML = version;
  document.getElementById('app-description').innerHTML = description;

  // get settings openAtLogin
  document.getElementById('openAtLoginSetting').checked = await getLoginSettings('openAtLogin');
  
  // if href is equivalent to [http, https, ftp] user electron shell
  const anchors = document.getElementsByTagName('a');
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (event) {
      event.preventDefault();
      const pattern = /^((http|https|ftp):\/\/)/;
      if (pattern.test(this.href)) {
        shell.openExternal(this.href);
      }
    });
  }
  
  // hide the window when the user press esc on their keyboard
  document.addEventListener('keydown', function (event) {
    const key = event || window.event;
    if (key.keyCode == 27) {
      hideActiveWindow();
    }
  });
  
  // hide the window when the user click on close button
  document.getElementById('close').addEventListener('click', function (event) {
    event.preventDefault();
    hideActiveWindow();
  });

  // start up settings on change event
  document.getElementById('openAtLoginSetting').addEventListener('change', function () {
    const checkboxValue = document.getElementById('openAtLoginSetting').checked;
    setLoginSettings('openAtLogin', checkboxValue);
  });

});
