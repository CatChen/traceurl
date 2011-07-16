const http = require('http');
const https = require('https');
const url = require('url');

const Async = require('jshelpers').Async;
const Overload = require('jshelpers').Overload;

var testUrl = 'http://cl.ly/8Led';

var urlToOptions = function(shortenedUrl) {
    var parsedUrl = url.parse(shortenedUrl);
    var protocol = parsedUrl.protocol.match(/^(.*):$/)[1];
    var host = parsedUrl.hostname
    var port = parsedUrl.port || (protocol == 'http' ? 80 : protocol == 'https' ? 443 : NaN);
    var path = parsedUrl.pathname
    return {
        protocol: protocol,
        host: host,
        port: port,
        path: path
    };
};

var asyncGet = function(shortenedUrl) {
    var operation = new Async.Operation();
    var optionsList = [];
    
    var asyncGetLoop = function(shortenedUrl) {
        console.log('resolving: ' + shortenedUrl);
        var options = urlToOptions(shortenedUrl);
        var protocol = options.protocol == 'http' ? http : https;
        
        for (var i = 0, l = optionsList.length; i < l; i++) {
            
        }
        optionsList.push(options);
        
        var request = protocol.get(options, function(response) {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                var newUrl = response.headers.location;
                asyncGetLoop(newUrl);
            } else {
                operation.yield(shortenedUrl)
            }
        });
    };
    asyncGetLoop(shortenedUrl);
    
    return operation;
};

var main = Overload
    .add([String], function(shortenedUrl) {
        return asyncGet(shortenedUrl)
            .addCallback(function(result) { console.log('resolved: ' + result); });
    });

if (process.argv.length > 1 && process.argv[1].match(/trace.js$/ig)) {
    main.apply(this, process.argv.slice(2));
}

module.exports = main;
