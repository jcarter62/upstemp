var express = require('express');
var router = express.Router();
var fb = require('firebase');


/* GET home page. */
router.get('/', function (req, res, next) {
    var sites = [];
    var fbRef = new fb('https://upstemp.firebaseio.com/');
    var fbData;

    fbRef.child('results').on('value', function (snapshot) {
        fbData = snapshot.val();

        for ( var item in fbData ) {
            var onesite = fbData[item];

            var rowclass;
            switch (onesite.status) {
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
            onesite.linkname = "";

            sites.push(onesite);
        }

        var v = {
            "title": "Show Status",
            "sites": sites
        };

        res.render('show', v);
        res.end();
    });
});

module.exports = router;
