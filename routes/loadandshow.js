var express = require('express');
var router = express.Router();

/* Load & Show */
router.get('/', function(req, res, next) {

    var file = __dirname + '/../js/loadall';
    require(file);
    delete require.cache[require.resolve(file)];

    res.redirect('/show');
});

module.exports = router;
