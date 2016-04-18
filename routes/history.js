var express = require('express');
var router = express.Router();
var fs = require('fs');

/* /history route */
router.get('/:id', function (req, res, next) {

    // Returns a number as string, of size length, zero padded.
    var zeroPad = function(num, size) {
        var n = num.toString();
        var result = '';

        for ( var i = 0; i < size; i++ ) {
            result = result + '0';
        }

        result = result + n;
        result = result.substring( result.length - size, result.length );
        return result;
    };


    var id = req.params.id;
    var file = __dirname + '/../history/' + id + '.json' ;
    var history = JSON.parse(fs.readFileSync(file)).history;

    var labels = [];
    var data = [];
    var thisId;

    // Let's get the last 24 hours, and create
    // averages for each hour.
    //
    var msIn24Hours = 24 * 60 * 60 * 1000;
    var dateNow = new Date();
    var minDate = new Date( dateNow.setTime( dateNow.getTime() - msIn24Hours ));

    var cmpStr ;
    cmpStr = zeroPad(minDate.getFullYear(),4) +
        zeroPad(minDate.getMonth()+1,2) + zeroPad(minDate.getDate(),2) +
        zeroPad(minDate.getHours(),2) + zeroPad(minDate.getMinutes(),2);

    var data = {};
    for ( var i=0; i < history.length; i++ ) {
        // check if in last 24 hours.
        if ( history[i].selectKey > cmpStr ) {
            // see if group exists.
            var groupId = data.history[i].group;
            console.log('groupId=' + groupId );
            if ( ! groupId ) {
                var newGroup = { groupid: [] };
                data.push( newGroup);
            }
            data.groupId.push(history[i]);
        }
    }

    var groupExists = function(grp, recs) {
        var result = false;
        for ( var i = 0; i < recs.length; i++ ) {
            var rec = recs[i];
        }
       return result;
    }

    console.dir(data);

    var skip = 1;

    if ( history.length > 20 ) {
        skip = history.length % 20;
    }

    console.log('skip = ' + skip );

    for (var i = 0; i < history.length; i = i + skip) {
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
