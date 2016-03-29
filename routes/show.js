var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

    var files = fs.readdirSync(__dirname + '/../results/');

    var sites = [];

    for ( var i = 0; i < files.length; i++ ) {
        var fname = __dirname + '/../results/' + files[i];
        var onesite = JSON.parse( fs.readFileSync(fname) );
        sites.push(onesite);
    }

    var v = {
    "title": "Show Status",
    "sites": sites
    };

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    res.render('show', v);

});

module.exports = router;
