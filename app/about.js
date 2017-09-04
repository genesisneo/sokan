
(function () {
    
    var package = require('../package.json'),
        {remote, shell} = require('electron');
    
    function init() {

        // set package.json values to all dom the requires it
        document.getElementById('version').innerHTML = package.version;
        document.getElementById('app-description').innerHTML = package.description;

        // if href is equivalent to [http, https, ftp] user electron shell
        var anchors = document.getElementsByTagName('a');
        for (var i=0; i<anchors.length; i++) {
            anchors[i].addEventListener('click', function(e) {
                var pattern = /^((http|https|ftp):\/\/)/;
                if (pattern.test(this.href)) {
                    shell.openExternal(this.href);
                }
                e.preventDefault();
            });
        }
        
        // hide the window when the user click on close button
        document.getElementById('close').addEventListener('click', function (e) {
            var window = remote.getCurrentWindow();
            window.hide();
        }); 

        // hide the window when the user press esc on their keyboard
        document.addEventListener('keydown', function(e) {
            var key = e || window.event;
            if (key.keyCode == 27) {
                var window = remote.getCurrentWindow();
                window.hide();
            }
        });

    }; 
    
    // call init function when page is ready
    document.onreadystatechange = function () {
        if (document.readyState == 'complete') {
            init();
        }
    };

})();
