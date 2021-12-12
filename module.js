const electron = require('electron');
const ffi = require('ffi-napi');

// create foreign function
const user32 = new ffi.Library('user32', {
  'GetForegroundWindow': ['long', []],
  'ShowWindow': ['bool', ['long', 'int']],
  'GetWindowRect': ['bool', ['long', 'pointer']],
  'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
  'GetWindowTextA': ['int32', ['int32','string','int32']]
});

// create rectangle from pointer
const pointerToRect = function (rectPointer) {
  return {
    left: rectPointer.readInt16LE(0),
    top: rectPointer.readInt16LE(4),
    right: rectPointer.readInt16LE(8),
    bottom: rectPointer.readInt16LE(12)
  };
}

// obtain window dimension
const getWindowDimensions = function (handle) {
  const rectPointer = Buffer.alloc(16);
  const getWindowRect = user32.GetWindowRect(handle, rectPointer);
  return !getWindowRect
    ? null
    : pointerToRect(rectPointer);
}

// get the active window title
const getWindowTitle = function (handle) {
  const title = Buffer.alloc(256);
  const window = user32.GetWindowTextA(handle, title, 256);
  return title.toString().substr(0, window);
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
  // get active window title and prevent specific windows modals
  const activeWindowTitle = getWindowTitle(activeWindow);
  const forbiddenTitles = [
    'feeds',
    'search',
    'cortana',
    'task view',
    'snap assist',
    'action center',
    'volume control',
    'task switching',
    'people bar flyout',
    'battery information',
    'network connections',
    'windows ink workspace',
    'date and time information'
  ];
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
