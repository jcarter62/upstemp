var express = require('express');
var router = express.Router();

/* Load */
router.get('/', function(req, res, next) {
    var file = __dirname + '/../js/loadall';
    require(file);
    res.render('load', {});
    delete require.cache[require.resolve(file)];
});

module.exports = router;
