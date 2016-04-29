var fb = require('firebase');
var Snmp = require('net-snmp');
var log4js = require('log4js');
var os = require('os');

var logDate = new Date();
var logDate = logDate.getFullYear().toString() +
    leftpad(( logDate.getMonth() + 1 ).toString(), 2, '0') +
    logDate.getDate().toString();
var logFileName = os.tmpdir() + '/upstemp-' + logDate + '.log';
var msg;

console.info('Logfile: ' + logFileName);

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(logFileName), 'cron');

var logger = log4js.getLogger('cron');

msg = logDate.toString();
logger.info(msg);

logger.info('Start');

var sites = {};
var urlRoot = 'https://upstemp.firebaseio.com/';
var fbRef = new fb(urlRoot);

var ItemsToProcess = 0;

function leftpad(str, len, ch) {
    str = String(str);
    var i = -1;
    if (!ch && ch !== 0) ch = ' ';
    len = len - str.length;
    while (++i < len) {
        str = ch + str;
    }
    return str;
}

function saveHistory(unit) {
    logger.info('+saveHistory %s', unit.name);
    var url = urlRoot + 'history/' + unit.name;
    var fbHist = new fb(url);
    var histRef = fbHist.child('data');
    var newHist = histRef.push().set(unit, function (error) {
        if (error) {
            logger.error('history push %s', error.toString());
        } else {
            logger.info('-saveHistory %s', unit.name);
        }
        ItemsToProcess--;
    });

}

function load1Site(Unit) {

    var OIds = [Unit.nameoid, Unit.locationoid, Unit.tempoid];
    var results = {};
    var session = new Snmp.createSession(Unit.ip, "public");

    logger.info('load1Site(' + Unit.ip + ')');

    session.get(OIds,
        function (err, varbinds) {
            if (err) {
                logger.error('snmp session.get error: %s', err.toString());
            } else {

                var name = "";
                var location = "";
                var data = "";
                for (var i = 0; i < varbinds.length; i++) {
                    if (Snmp.isVarbindError(varbinds[i])) {
                        logger.error('snmp.isVarbindError: %s', JSON.stringify(varbinds[i]));
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
                logger.info('*** Results ***');
                logger.info(JSON.stringify(Unit.results));
                var child = 'results/' + Unit.results.name;
                logger.info('child = %s', child);
                var resultsRef = fbRef.child(child);

                var setOnComplete = function (error) {
                    if (error) {
                        logger.error('Synchronization failed for child= %s ', child);
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

fbRef.child('sites').on('value',
    function (snapshot) {
        sites = snapshot.val();

        logger.info('Snapshot value received...');

        for (var i = 0; i < sites.length; i++) {
            logger.info('load site' + sites[i].ip);
            ItemsToProcess++;
            load1Site(sites[i]);
        }
    },
    function (errorObj) {
        logger.info('Sites Read Failed: ' + errorObj.code);
    }
);

var msSince1970 = Date.now();
var msIn30 = msSince1970 + (30 * 1000);

setInterval(function () {
    var msNow = Date.now();
    if (ItemsToProcess <= 0) {
        logger.info("Normal Exit");
        process.exit();
    }
    if (msNow > msIn30) {
        logger.info("Timeout Exit **** ");
        process.exit();
    }
}, 2000);
