
var winctl = require('./modules/winctl'),
    electron = require('electron');

exports.windowControl = function(position) {

    var screens = electron.screen,
        win = winctl.GetActiveWindow(),
        displays = screens.getAllDisplays(),
        activeMonitor = screenBounds = screenWorkAreaSize = newX = newY = newW = newH = null;

    if (displays.length === 1) {
        // if there is only one monitor, set activeMonitor to primary display
        activeMonitor = screens.getPrimaryDisplay();
    } else {
        // if there is multiple monitors, set activeMonitor where the mouse is present
        activeMonitor = screens.getDisplayNearestPoint( screens.getCursorScreenPoint() );
    }

    // set screen bounds and available work area
    screenBounds = activeMonitor.bounds;
    screenWorkAreaSize = activeMonitor.workAreaSize;

    // set newX, newY, newW, and newH values and consider "margin:0px 7px 7px" window margins
    switch(position) {

        // upper left
        case 'ul':
            newX = (screenBounds.x-7);
            newY = screenBounds.y;
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = ((screenWorkAreaSize.height/2)+7);
            break;

        // upper half
        case 'uh':
            newX = (screenBounds.x-7);
            newY = screenBounds.y;
            newW = (screenWorkAreaSize.width+14);
            newH = ((screenWorkAreaSize.height/2)+7);
            break;

        // upper right
        case 'ur':
            newX = (((((screenBounds.x+screenWorkAreaSize.width)-screenBounds.x)/2)+screenBounds.x)-7);
            newY = screenBounds.y;
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = ((screenWorkAreaSize.height/2)+7);
            break;

        // half left
        case 'hl':
            newX = (screenBounds.x-7);
            newY = screenBounds.y;
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = (screenWorkAreaSize.height+7);
            break;

        // center
        case 'c':
            var currentWidth = win.dimensions().right - win.dimensions().left,
                currentHeight = win.dimensions().bottom - win.dimensions().top;
                halfScreenWidth = ((((screenBounds.x+screenWorkAreaSize.width)-screenBounds.x)/2)+screenBounds.x),
                halfScreenHeight = ((((screenBounds.y+screenWorkAreaSize.height)-screenBounds.y)/2)+screenBounds.y),
            newX = (halfScreenWidth-(currentWidth/2));
            newY = (halfScreenHeight-(currentHeight/2));
            newW = currentWidth;
            newH = currentHeight;
            break;

        // half right
        case 'hr':
            newX = (((((screenBounds.x+screenWorkAreaSize.width)-screenBounds.x)/2)+screenBounds.x)-7);
            newY = screenBounds.y;
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = (screenWorkAreaSize.height+7);
            break;

        // lower left
        case 'll':
            newX = (screenBounds.x-7);
            newY = ((((screenBounds.y+screenWorkAreaSize.height)-screenBounds.y)/2)+screenBounds.y);
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = ((screenWorkAreaSize.height/2)+7);
            break;

        // lower half
        case 'lh':
            newX = (screenBounds.x-7);
            newY = ((((screenBounds.y+screenWorkAreaSize.height)-screenBounds.y)/2)+screenBounds.y);
            newW = (screenWorkAreaSize.width+14);
            newH = ((screenWorkAreaSize.height/2)+7);
            break;

        // lower right
        case 'lr':
            newX = (((((screenBounds.x+screenWorkAreaSize.width)-screenBounds.x)/2)+screenBounds.x)-7);
            newY = ((((screenBounds.y+screenWorkAreaSize.height)-screenBounds.y)/2)+screenBounds.y);
            newW = ((screenWorkAreaSize.width/2)+14);
            newH = ((screenWorkAreaSize.height/2)+7);
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

    // move window based on newX, newY, newW, and newH values
    win.move(newX, newY, newW, newH);

}
