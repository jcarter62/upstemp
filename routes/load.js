var express = require('express');
var router = express.Router();

/* Load */
router.get('/', function(req, res, next) {
    var loader;
    if ( require.cache[loader] ) {
        delete require.cache[loader];
    }
    loader = require( __dirname + '/../load');

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.render('load', {});
});

module.exports = router;
