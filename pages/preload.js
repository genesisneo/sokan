const {
  contextBridge,
  ipcRenderer,
  shell
} = require('electron');
const {
  productName,
  version,
  description
} = require('../package.json');

contextBridge
  .exposeInMainWorld(
    'sokan',
    {
      productName,
      version,
      description,
      shell,
      hideActiveWindow: function () {
        ipcRenderer.send('hideActiveWindow');
      },
      getLoginSettings: function (key) {
        return ipcRenderer
          .invoke('getLoginSettings', key)
          .then(function (response) {
            return response;
          })
          .catch(function (error) {
            console.log('Error:\n', error);
          });
      },
      setLoginSettings: async function (key, value) {
        ipcRenderer.send('setLoginSettings', key, value);
      }
    }
  );
