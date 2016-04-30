var fb = require('firebase');
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

logger.info('removeold Start');

var sites = {};
var urlRoot = 'https://upstemp.firebaseio.com/';
var fbRef = new fb(urlRoot + 'history/');

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

function removeHistory(unit) {
    logger.info('+removeHistory %s', unit.name);
}

// https://upstemp.firebaseio.com/history
fbRef.once('value',
    function (snapshot) {

        snapshot.forEach(function (childSnap) {
            var key = childSnap.key();

            removeOldRecords(key);
        })
    },
    function (errorObj) {
        logger.info('history Read Failed: ' + errorObj.code);
    }
);

// determine time stamp of 3 days ago (in ms).
var timeLimit = Date.now() - ( 3 * 24 * 60 * 60 * 1000 );

function removeOldRecords(siteName) {
    var pathToData = urlRoot + 'history/' + siteName + '/data';
    var fbHist = new fb(pathToData);

    fbHist.once('value',
        function (snap) {

            snap.forEach(function (childSnap) {
                var key = childSnap.key();
                var dat = childSnap.val();

                if (dat.dateNum < timeLimit) {
                    var rmKey = pathToData + '/' + key;
                    var refDel = new fb(rmKey);
                    refDel.remove(function (error) {
                        if (error) {
                            console.log('History Rec Del failed');
                        } else {
                            console.log('History Rec Del succeeded');
                        }
                    });
                }
            });
        },
        function (errorObj) {
            logger.info('removeOldRecords, failed read' + errorObj.code);
        }
    );
}

var msSince1970 = Date.now();
var msIn30 = msSince1970 + (60 * 1000);

setInterval(function () {
    var msNow = Date.now();
    if (msNow > msIn30) {
        logger.info("Timeout Exit **** ");
        process.exit();
    }
}, 2000);
