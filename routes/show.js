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

        var rowclass;
        switch ( onesite.status ) {
            case "warn":
                rowclass = "alert alert-warning";
                break;
            case "alarm":
                rowclass = "alert alert-danger";
                break;
            default:
                rowclass = "alert alert-success";
                break;
        }
        onesite.rowclass = rowclass;

        sites.push(onesite);
    }

    var v = {
    "title": "Show Status",
    "sites": sites
    };

    res.render('show', v);

});

module.exports = router;
