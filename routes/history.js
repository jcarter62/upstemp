var express = require('express');
var router = express.Router();
var fs = require('fs');

/* /history route */
router.get('/:id', function (req, res, next) {

    var id = req.params.id;
    var file = __dirname + '/../history/' + id ;
    var history = JSON.parse(fs.readFileSync(file)).history;

    console.dir(history);

    var labels = [];
    var data = [];
    var thisId;

    for (var i = 0; i < history.length; i++) {
        console.log(i);
        labels.push(history[i].timestamp);
        data.push(history[i].temperature);
        thisId = history[i].name;
    }

    console.dir(labels);
    console.dir(data);

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
    };

    res.render('history', v);

});

module.exports = router;
