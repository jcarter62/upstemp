"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');
var fb = require('firebase');

/* /history route */
router.get('/:id', function (req, res, next) {
    var workQueue = 0;
    var id = req.params.id;
    var fbRef = new fb('https://upstemp.firebaseio.com/history/' + id + '/data');

    var labels = [];
    var data = [];
    var thisId;

    console.info('history/' + id  );

    fbRef.once('value',
        function (snap) {
            //
            // for each data record, push the record on to
            //
            var every30 = 0;
            snap.forEach(function (childSnap) {
                workQueue++;
                every30++;

                var key = childSnap.key();
                var dat = childSnap.val();
                if ( (every30 % 30) == 0 ) {
                    console.dir(dat);
                    labels.push(dat.timestamp);
                } else {
                    labels.push("");
                }
                data.push(dat.temperature);
                thisId = dat.name;
                workQueue--;
            });

            var lineChartData = {
                labels:labels,
                datasets: [
                    {
                        label:id,
                        fillColor : "rgba(220,220,220,0.2)",
                        strokeColor : "rgba(220,220,220,1)",
                        pointColor : "rgba(220,220,220,1)",
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff",
                        pointHighlightStroke : "rgba(220,220,220,1)",
                        data: data
                    }
                ]
            };

            var v = {
                title:'history',
                labels: JSON.stringify(labels),
                data: JSON.stringify(data),
                id: JSON.stringify(thisId)
            }

            renderPage(v.title, v);
        },
        function (errorObj) {

            console.info('read records failed' + errorObj.code);

            var v = {
                title:'history',
                labels: JSON.stringify(labels),
                data: JSON.stringify(data),
                id: JSON.stringify(thisId)
            };

            renderPage('history', v);
        }
    );

    var msSince1970 = Date.now();
    var msIn30 = msSince1970 + (30 * 1000);

    /*
    setInterval(function () {
        var msNow = Date.now();
        if (workQueue <= 0) {
            var v = {
                title:'history',
                labels: JSON.stringify(labels),
                data: JSON.stringify(data),
                id: JSON.stringify(thisId)
            };
            res.render('history', v);
            res.end();
        }
        if (msNow > msIn30) {
            var v = {
                title:'history',
                labels: JSON.stringify(labels),
                data: JSON.stringify(data),
                id: JSON.stringify(thisId)
            };
            res.render('history', v);
            res.end();
        }
    }, 1000);
    */

    function renderPage(title, obj) {
        res.render(title, obj);
        res.end();
    }
});

module.exports = router;
