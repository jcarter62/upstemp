var fb = require('firebase');
var log4js = require('log4js');
var os = require('os');

var logDate = new Date();
var logDate = logDate.getFullYear().toString() +
    leftpad(( logDate.getMonth() + 1 ).toString(), 2, '0') +
    leftpad(logDate.getDate().toString(), 2, '0');
var logFileName = os.tmpdir() + '/upstemp-' + logDate + '.log';
var msg;

console.info('Logfile: ' + logFileName);

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(logFileName), 'cron');

var logger = log4js.getLogger('cron');

msg = logDate.toString();
qLog(msg);


var urlRoot = 'https://upstemp.firebaseio.com/';
var fbRef = new fb(urlRoot + 'history/');
var workQueue = 0;

qLog('removeold Start');

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

/*
function removeHistory(unit) {
 qLog('+removeHistory %s', unit.name);
}
 */

// https://upstemp.firebaseio.com/history
fbRef.once('value',
    function (snapshot) {

        snapshot.forEach(function (childSnap) {
            workQueue++;
            var key = childSnap.key();
            removeOldRecords(key);
            workQueue--;
        })
    },
    function (errorObj) {
        qLog('history Read Failed: ' + errorObj.code);
    }
);

// determine time stamp of 3 days ago (in ms).
var timeConsideredOld = Date.now() - ( 3 * 24 * 60 * 60 * 1000 );

function removeOldRecords(siteName) {
    var pathToData = urlRoot + 'history/' + siteName + '/data';
    var fbHist = new fb(pathToData);

    workQueue++;
    fbHist.once('value',
        function (snap) {

            snap.forEach(function (childSnap) {
                var key = childSnap.key();
                var dat = childSnap.val();
                workQueue++;

                if (dat.dateNum < timeConsideredOld) {
                    var rmKey = pathToData + '/' + key;
                    var refDel = new fb(rmKey);
                    var logMsg;
                    workQueue++;
                    logMsg = 'Del Queue:key=' + key;
                    qLog(logMsg);
                    refDel.remove(function (error) {
                        workQueue--;
                        logMsg = 'key=' + key;
                        if (error) {
                            qLog('Del Fail' + logMsg);
                        } else {
                            qLog('Del Okay:' + logMsg);
                        }
                    });
                }
                workQueue--;
            });
        },
        function (errorObj) {
            qLog('removeOldRecords, failed read' + errorObj.code);
        }
    );
    workQueue--;
}

function qLog(msg) {
    var s = msg + ', Q=' + workQueue;
    logger.info(s);
}

var msSince1970 = Date.now();
var msIn30 = msSince1970 + (30 * 1000);
var msIn5 = msSince1970 + ( 5 * 1000 );

// check to see if we need to exit every 2 seconds.
setInterval(function () {
    var msNow = Date.now();

    // Exit application when workQueue is zero, and 5 seconds elapsed.
    if (( workQueue <= 0 ) && ( msNow > msIn5 )) {
        qLog('workQueue empty, normal exit ****');
        process.exit();
    }

    // Timeout after 30 seconds.
    if (msNow > msIn30) {
        qLog('Timeout Exit ****');
        process.exit();
    }
}, 2000);
