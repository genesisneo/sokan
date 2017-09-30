<p align="center">
    <img src="./app/assets/images/application.jpg"><br><br>
</p>

# Window Control

Move and resize windows with ease. Window control with simple keyboard shortcuts.

---

#### Table of Contents:
* [How to setup](#how-to-setup)
* [Known bugs](#known-bugs)
* [Question](#question)

---

## How to setup:

* This application only works on **_Windows Desktop_** device
* Download, Fork, or Clone this repo
* Download and install [node.js ^6.0.0](https://nodejs.org/en/download/releases/). If you need multiple version you can use [nvm-windows](https://github.com/coreybutler/nvm-windows)
* Open your prefered **_shell_** and navigate to this repo and install the dependecies using `npm i`
* Once dependecies are installed, navigate to `./app` folder and create a new folder named `./modules`
* Download [winctl](https://github.com/thraaawn/winctl) modules by [@thraaawn](https://github.com/thraaawn) or my [fork](https://github.com/genesisneo/winctl) version
* Extract `winctl-master.zip` inside `./modules` and rename `./winctrl-master` to `./winctl`
* Install `node-gyp` and `windows-build-tools` globally `npm i -g node-gyp windows-build-tools`
* Once complete, you need to configure your **_Python 2.7_** by  `npm config set python python2.7`
* Configure `msvs 2015` using `npm config set msvs_version 2015`
* Set Python executable path using `node-gyp` by this command `npm config set python C:\Users\{user}\.windows-build-tools\python27\python.exe` where `{user}` is your **_Windows_** user name
* Open **_Environment Variables_** and add `PYTHON` with the value of `%USERPROFILE%\.windows-build-tools\python27\python.exe` under **_User variables for Windows_**
* Add `PY_HOME` with value of `%USERPROFILE%\.windows-build-tools\python27\` under **_System variables_**
* Look for `Path` on **_System variables_** and add this values through "Edit text..." `%PY_HOME%;%PY_HOME%\Lib;%PY_HOME%\DLLs;%PY_HOME%\Lib\lib-tk;`
* Close **_Environment Variables_** and restart your prefered **_shell_**
* On your prefered **_shell_**, navigate to this repo and to `./app/modules/winctl`
* Install **_winctl_** dependecies using `npm i`
* Configure **_winctl_** using `node-gyp configure` and build it by `node-gyp build`
* Install `electron-rebuild` inside **_winctl_** using `npm i electron-rebuild` and rebuild the whole module by this command `./node_modules/.bin/electron-rebuild`
* On your prefered **_shell_**, navigate to the **_root_** directory
* You can now **_start_** the application using `npm start` and **_build_** it using `npm build`

---

## Known bugs:

* If you have an `error` on **_winctl_** regarding `events` or `nan` module, just install them by doing `npm i nan events`. Once installed you need to **_configure_** and **_rebuild_** it on `node-gyp` and lastly **_rebuild_** it on `electron-rebuild`.
* The number `0` to `9` shortcuts on [Electron Accelerator](https://github.com/electron/electron/blob/master/docs/api/accelerator.md) only works on **_Number Rows_** but not on **_Numeric Keypad_**. This is still an open [bug](https://github.com/electron/electron/issues/3332#ref-issue-127245157) on [Electron](https://github.com/electron) repo.
* If you try to move or re-arrange windows through taskbar tray icon, it won't work. This is becuase the application look for the **_Active Window_**, clicking on the taskbar lost the window focus events.

---

## Question:

If you have question, you can always contact me on Twitter [@genesis_neo](https://twitter.com/genesis_neo) and of course here in GitHub [@genesisneo](https://github.com/genesisneo). Thank you.

---

<p align="center">-=[ :heart: ]=-</p>