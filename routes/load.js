var express = require('express');
var router = express.Router();

/* Load */
router.get('/', function(req, res, next) {
    var loader;
    if ( require.cache[loader] ) {
        delete require.cache[loader];
    }
    loader = require( __dirname + '/../js/loadall');
    delete loader;

    res.render('load', {});
});

module.exports = router;
