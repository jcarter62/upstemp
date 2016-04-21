var fb = require('firebase');
var Snmp = require('net-snmp');
var sites = {};
var urlRoot = 'https://upstemp.firebaseio.com/';
var fbRef = new fb(urlRoot);

var ItemsToProcess = 0;

function saveHistory(unit) {
    var url = urlRoot + 'history/' + unit.name;
    var fbHist = new fb(url);
    var histRef = fbHist.child('data');
    var newHist = histRef.push().set(unit, function (error) {
        ItemsToProcess--;
    });

}

function load1Site(Unit) {

    var OIds = [Unit.nameoid, Unit.locationoid, Unit.tempoid];
    var results = {};
    var session = new Snmp.createSession(Unit.ip, "public");

    console.log('load1Site(' + Unit.ip + ')');

    session.get(OIds,
        function (err, varbinds) {
            if (err) {
                console.dir(err);
            } else {

                var name = "";
                var location = "";
                var data = "";
                for (var i = 0; i < varbinds.length; i++) {
                    if (Snmp.isVarbindError(varbinds[i])) {
                        console.dir(Snmp.varbindError(varbinds[i]));
                    }
                    else {
                        var oid = varbinds[i].oid;
                        var dat = varbinds[i].value.toString();
                        switch (oid) {
                            case Unit.nameoid:
                                name = dat;
                                break;
                            case Unit.tempoid:
                                data = dat;
                                break;
                            case Unit.locationoid:
                                location = dat;
                                break;
                            default:
                                break;
                        }
                    }
                }
                var ts = new Date();
                var timeStamp;
                timeStamp = ts.toLocaleString();
                var status = "ok";
                if (data >= Unit.warn) {
                    status = "warn";
                }
                if (data >= Unit.alarm) {
                    status = "alarm";
                }
                Unit.results = {
                    name: name,
                    temperature: data,
                    location: location,
                    timeStamp: timeStamp,
                    status: status,
                    timestamp: ts.toLocaleTimeString(),
                    dateNum: Date.parse(timeStamp)
                };
                console.log('*** Results ***');
                console.dir(Unit.results);
                var child = 'results/' + Unit.results.name;
                console.log('child = ' + child);
                var resultsRef = fbRef.child(child);

                var setOnComplete = function (error) {
                    if (error) {
                        console.log('Synchronization failed for child=' + child);
                    } else {
                        // need to save history.
                        ItemsToProcess++;
                        saveHistory(Unit.results);
                    }
                    // results completed with or without error.
                    ItemsToProcess--;
                };
                // Save the results for this unit
                resultsRef.set(Unit.results, setOnComplete);
            }
        });

}


fbRef.child('sites').on('value', function (snapshot) {
    sites = snapshot.val();

    for ( var i = 0; i < sites.length; i++ ) {
        ItemsToProcess++;
        load1Site(sites[i]);
    }
});

setInterval( function() {
    if ( ItemsToProcess <= 0 ) {
        process.exit();
    }
}, 2000 );
