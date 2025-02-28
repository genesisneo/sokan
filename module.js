const electron = require('electron');
const koffi = require('koffi');

// create rect pointer
const Rect = koffi.struct('Rect', {left: 'ulong', top: 'ulong', right: 'ulong', bottom: 'ulong'});
const RectPointer = koffi.pointer('RectPointer', 'Rect');

// access foreign function
const library = koffi.load('user32.dll');
const user32 = {
  'ShowWindow': library.func('ShowWindow', 'bool', ['long', 'int']),
  'GetForegroundWindow': library.func('GetForegroundWindow', 'long', []),
  'GetWindowTextA': library.func('GetWindowTextA', 'int32', ['int32','string','int32']),
  'GetWindowRect': library.func('GetWindowRect', 'bool', ['long', koffi.out(RectPointer)]),
  'SetWindowPos': library.func('SetWindowPos', 'bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint'])
}

// obtain window dimension
const getWindowDimensions = function (handle) {
  const rectPointer = {};
  const getWindowRect = user32.GetWindowRect(handle, rectPointer);
  return !getWindowRect
    ? null
    : rectPointer;
}

// get the active window title
const getWindowTitle = function (handle) {
  const buffer = Buffer.allocUnsafe(1024);
  const window = user32.GetWindowTextA(handle, buffer, 1024);
  return !window ? '' : koffi.decode(buffer, 'char', window).trim();
}

module.exports = function (position) {

  // electron screens
  const screens = electron.screen;

  // current mouse pointer position
  const currentMousePosition = screens.getCursorScreenPoint();
  const { scaleFactor, depthPerComponent, workArea } = screens.getAllDisplays().length > 1
    // get monitor where mouse is active
    ? screens.getDisplayNearestPoint(currentMousePosition)
    // get the primary monitor
    : screens.getPrimaryDisplay();

  // convert workArea to dip screen rectangle
  const updatedWorkArea = screens.dipToScreenRect(null, workArea);

  // multiply value by current display scale factor
  const multiplyByCurrentDisplayScaleFactor = function (value) {
    return value * scaleFactor;
  };

  // window shadow margin { left: 7, top: 0, right: 7, bottom: 7 } + 1px border on 100% scale
  const computedComponentDepth = multiplyByCurrentDisplayScaleFactor(depthPerComponent - scaleFactor);

  // workArea
  const workAreaX = updatedWorkArea.x;
  const workAreaY = updatedWorkArea.y;
  const workAreaWidth = updatedWorkArea.width;
  const workAreaHeight = updatedWorkArea.height;

  // computed bounds
  const boundsXDefault = workAreaX - computedComponentDepth;
  const boundsXMiddle = workAreaX - computedComponentDepth + workAreaWidth / 2;
  const boundsYDefault = workAreaY;
  const boundsYMiddle = workAreaY + workAreaHeight / 2;
  const boundsWidthFull = workAreaWidth + (computedComponentDepth * 2);
  const boundsWidthHalf = workAreaWidth / 2 + (computedComponentDepth * 2);
  const boundsHeightFull = workAreaHeight + computedComponentDepth;
  const boundsHeightHalf = workAreaHeight / 2 + computedComponentDepth;

  // get active window
  const activeWindow = user32.GetForegroundWindow();

  // get active window title and prevent specific window from moving
  const activeWindowTitle = getWindowTitle(activeWindow);
  const forbiddenTitles = [
    'feeds',
    'sokan',
    'search',
    'copilot',
    'cortana',
    'task view',
    'snap assist',
    'action center',
    'quick settings',
    'task switching',
    'volume control',
    'people bar flyout',
    'battery information',
    'notification center',
    'network connections',
    'windows ink workspace',
    'date and time information',
    'system tray overflow window'
  ];

  console.log(`Window: ${activeWindowTitle.toLowerCase()}`);

  // do not move forbidden window
  if (activeWindowTitle === '' || forbiddenTitles.includes(activeWindowTitle.toLowerCase())) {
    return false;
  }

  // get and set window dimension
  const activeWindowDimensions = getWindowDimensions(activeWindow);

  // create bounds object
  const bounds = {}

  switch (position) {
    // upper left
    case 'ul':
      bounds.x = boundsXDefault;
      bounds.y = boundsYDefault;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightHalf;
      break;

    // upper half
    case 'uh':
      bounds.x = boundsXDefault;
      bounds.y = boundsYDefault;
      bounds.w = boundsWidthFull;
      bounds.h = boundsHeightHalf;
      break;

    // upper right
    case 'ur':
      bounds.x = boundsXMiddle;
      bounds.y = boundsYDefault;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightHalf;
      break;

    // half left
    case 'hl':
      bounds.x = boundsXDefault;
      bounds.y = boundsYDefault;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightFull;
      break;

    // center
    case 'c':
      const currentWidth = activeWindowDimensions.right - activeWindowDimensions.left;
      const currentHeight = activeWindowDimensions.bottom - activeWindowDimensions.top;
      const halfScreenWidth = ((workAreaWidth / 2) + workAreaX);
      const halfScreenHeight = ((workAreaHeight / 2) + workAreaY);
      bounds.x = halfScreenWidth - (currentWidth / 2);
      bounds.y = halfScreenHeight - (currentHeight / 2);
      bounds.w = currentWidth;
      bounds.h = currentHeight;
      break;

    // half right
    case 'hr':
      bounds.x = boundsXMiddle;
      bounds.y = boundsYDefault;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightFull;
      break;

    // lower left
    case 'll':
      bounds.x = boundsXDefault;
      bounds.y = boundsYMiddle;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightHalf;
      break;

    // lower half
    case 'lh':
      bounds.x = boundsXDefault;
      bounds.y = boundsYMiddle;
      bounds.w = boundsWidthFull;
      bounds.h = boundsHeightHalf;
      break;

    // lower right
    case 'lr':
      bounds.x = boundsXMiddle;
      bounds.y = boundsYMiddle;
      bounds.w = boundsWidthHalf;
      bounds.h = boundsHeightHalf;
      break;

    // fallback
    default:
      console.log(
        '+ Supported Position:\n' +
        '- Upper Left: \t windowControl("ul") \n' +
        '- Upper Half: \t windowControl("uh") \n' +
        '- Upper Right: \t windowControl("ur") \n' +
        '- Half Left: \t windowControl("hl") \n' +
        '- Center: \t\t windowControl("c") \n' +
        '- Half Right: \t windowControl("hr") \n' +
        '- Lower Left: \t windowControl("ll") \n' +
        '- Lower Half: \t windowControl("lh") \n' +
        '- Lower Right: \t windowControl("lr")'
      );
      break;
  }

  // force active window to restore mode
  user32.ShowWindow(activeWindow, 9);

  // set window position based on bounds values
  user32.SetWindowPos(
    activeWindow,
    0,
    bounds.x,
    bounds.y,
    bounds.w,
    bounds.h,
    0x4000 | 0x0020 | 0x0020 | 0x0040
  );

  // moving from different screen scales requires re-run of SetWindowPos
  setTimeout(function () {
    user32.SetWindowPos(
      activeWindow,
      0,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h,
      0x4000 | 0x0020 | 0x0020 | 0x0040
    );
  }, 0);

}
