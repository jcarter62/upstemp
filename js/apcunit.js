var fs = require('fs');
var snmp = require('net-snmp');

/*
 * Open an input json file for parameters, and output
 * results into same name file in results directory.
 *
 * This module will request data from a APC UPS using
 * the oids found in the input file.
 */
module.exports = function(apcName) {

    var configFile = __dirname + '/../input/' + apcName + '.json';
    console.log('configfile = ' + configFile );
    var config = JSON.parse(fs.readFileSync(configFile)).ups;
    console.dir(config);

    var ip = config.ip;

    var NameOid = config.nameoid;
    var TempOid = config.tempoid;
    var LocationOid = config.locationoid;
    var warn = config.warn;
    var alarm = config.alarm;

    var OIds = [NameOid, LocationOid, TempOid];

    var session = new snmp.createSession(ip, "public");

    var results = {};

    session.get(OIds, function (error, varbinds) {
        if (error) {
            console.dir(error);
        } else {
            var name = "";
            var location = "";
            var data = "";

            for (var i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError(varbinds[i])) {
                    console.dir(snmp.varbindError(varbinds[i]));
                } else {
                    var oid = varbinds[i].oid;
                    var dat = varbinds[i].value.toString();

                    switch (oid) {
                        case NameOid:
                            name = dat;
                            break;
                        case TempOid:
                            data = dat;
                            break;
                        case LocationOid:
                            location = dat;
                            break;
                        default:
                            break;
                    }
                }
            }
            var ts = new Date();
            var tstamp; // = ts.toISOString();
            tstamp = ts.toLocaleString();

            var status = "ok";
            if ( data >= warn ) {
                status = "warn";
            }
            if ( data >= alarm ) {
                status = "alarm";
            }

            results = {
                name: name,
                temperature: data,
                location: location,
                tstamp: tstamp,
                status: status,
                timestamp: ts.toLocaleTimeString(),
                datenum : Date.parse(tstamp)
            };

            var newfilename = __dirname + '/../results/' + apcName + '.json';
            console.log('File: ' + newfilename);
            fs.unlinkSync(newfilename);
            console.log('Unlinked...');
            fs.writeFileSync( newfilename, JSON.stringify(results, null, 2), 'utf-8');
            console.log('writeFile: ' + newfilename );

            var histfile = __dirname + '/../history/' + apcName + '.json';
            if ( ! fs.existsSync(histfile)  ) {
                var h = { "history": [] };
                fs.writeFileSync( histfile, JSON.stringify( h, null, 2), 'utf-8' );

            }

            var hist = JSON.parse( fs.readFileSync(histfile) );
            var newHistoryRecord = {
                name: name,
                temperature: data,
                status: status,
                timestamp: ts.toLocaleTimeString(),
            };

            hist.history.push(newHistoryRecord);

            console.dir(hist);
            fs.writeFileSync( histfile, JSON.stringify( hist, null, 2 ), 'utf-8');
//            fs.closeSync();
        }
    });

    session.trap(snmp.TrapType.LinkDown, function (error) {
        if (error) {
            console.dir(error);
        }
    })
}
