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

const getWindowTitle = function (handle) {
  const title = Buffer.alloc(256);
  const window = user32.GetWindowTextA(handle, title, 256);
  return title.toString().substr(0, window);
}

module.exports = function (position) { 
  // electron screens
  const screens = electron.screen;
  const getCursorScreenPoint = screens.getCursorScreenPoint();
  const primaryDisplayScaleFactor = screens.getPrimaryDisplay().scaleFactor;
  const { scaleFactor, depthPerComponent, workArea } = screens.getAllDisplays().length > 1
    // get monitor where mouse is active
    ? screens.getDisplayNearestPoint(getCursorScreenPoint)
    // get the primary monitor
    : screens.getPrimaryDisplay();

  // multiply value by current display scale factor
  const multiplyByCurrentDisplayScaleFactor = function (value) {
    return value * scaleFactor;
  };

  // window shadow margin { left: 7, ttop: 0, right: 7, bottom: 7 } + 1px border
  const singleSideMargin = multiplyByCurrentDisplayScaleFactor(depthPerComponent - scaleFactor);
  const bothSideMargin = multiplyByCurrentDisplayScaleFactor((depthPerComponent * 2) - (scaleFactor * 2));

  // workArea
  const wokrAreaX = workArea.x < 0
    ? workArea.x > -Math.abs(workArea.width) && scaleFactor < primaryDisplayScaleFactor
      ? -Math.abs(((workArea.x + workArea.width) / primaryDisplayScaleFactor) * scaleFactor)
      : workArea.x * scaleFactor
    : workArea.x * primaryDisplayScaleFactor;
  const wokrAreaY = workArea.y < 0
    ? workArea.y > -Math.abs(workArea.height) && scaleFactor < primaryDisplayScaleFactor
      ? -Math.abs((workArea.y + (workArea.height / primaryDisplayScaleFactor)) * scaleFactor)
      : workArea.y * scaleFactor
    : workArea.y * primaryDisplayScaleFactor;
  const wokrAreaWidth = multiplyByCurrentDisplayScaleFactor(workArea.width);
  const wokrAreaHeight = multiplyByCurrentDisplayScaleFactor(workArea.height);

  // computed bounds
  const boundsXDefault = wokrAreaX - singleSideMargin;
  const boundsXMiddle = ((wokrAreaWidth / 2) + wokrAreaX) - singleSideMargin;
  const boundsYDefault = wokrAreaY;
  const boundsYMiddle = ((wokrAreaHeight / 2) + wokrAreaY);
  const boundsWithFull = wokrAreaWidth + bothSideMargin;
  const boundsWidthHalf = (wokrAreaWidth / 2) + bothSideMargin;
  const boundsHeightFull = wokrAreaHeight + singleSideMargin;
  const boundsHeightHalf = (wokrAreaHeight / 2) + singleSideMargin;

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
      bounds.w = boundsWithFull;
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
      const halfScreenWidth = ((wokrAreaWidth / 2) + wokrAreaX);
      const halfScreenHeight = ((wokrAreaHeight / 2) + wokrAreaY);
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
      bounds.w = boundsWithFull;
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
  // set window position based on bounds values twice
  user32.SetWindowPos(
    activeWindow,
    0,
    bounds.x,
    bounds.y,
    bounds.w,
    bounds.h,
    0x4000 | 0x0020 | 0x0020 | 0x0040
  );
  user32.SetWindowPos(
    activeWindow,
    0,
    bounds.x,
    bounds.y,
    bounds.w,
    bounds.h,
    0x4000 | 0x0020 | 0x0020 | 0x0040
  );
}