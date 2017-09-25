// class for creating & handling the dat.gui controls
// as well as creating a common interface for all modes to use

var GUI = (function(scope) {
    // constructor
    function GUI() {}

    // init method
    GUI.prototype.init = function(mode) {
        // body...
    };

    scope.GUI = GUI;
    return GUI;
})(typeof exports === 'undefined' ? {} : exports);