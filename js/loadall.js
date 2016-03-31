var fs = require('fs');
var apc = require('./apcunit.js');

module.exports = function() {
    var files = fs.readdirSync(__dirname + '/../input/');
    var filename;
    var apcUnit;

    for ( var i = 0; i < files.length; i++ ) {
        filename = files[i];
        filename = filename.substring(0, filename.length - 5 );

        apcUnit = new apc(filename);
        delete apcUnit;
    }
}();
