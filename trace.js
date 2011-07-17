const http = require('http');
const https = require('https');
const url = require('url');

const Async = require('jshelpers').Async;

var urlToOptions = function(shortenedUrl) {
    var parsedUrl = url.parse(shortenedUrl);
    var protocol = parsedUrl.protocol.match(/^(.*):$/)[1];
    var host = (parsedUrl.auth ? parsedUrl.auth : '') + parsedUrl.hostname;
    var port = parsedUrl.port || (protocol == 'http' ? 80 : protocol == 'https' ? 443 : NaN);
    var path = parsedUrl.pathname + (parsedUrl.search ? parsedUrl.search : '');
    return {
        protocol: protocol,
        host: host,
        port: port,
        path: path
    };
};

var isSameOptions = function(options1, options2) {
    return options1.protocol === options2.protocol
        && options1.host === options2.host
        && options1.port === options2.port
        && options1.path === options2.path
}

var asyncGet = function(shortenedUrl) {
    var operation = new Async.Operation();
    var optionsList = [];
    
    var asyncGetLoop = function(shortenedUrl) {
        console.log('resolving: ' + shortenedUrl);
        var options = urlToOptions(shortenedUrl);
        var protocol = options.protocol == 'http' ? http : https;
        
        for (var i = 0, l = optionsList.length; i < l; i++) {
            if (isSameOptions(optionsList[i], options)) {
                /* infinite loop in redirection */
                operation.yield();
            }
        }
        optionsList.push(options);
        
        var request = protocol.get(options, function(response) {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                var newUrl = url.resolve(shortenedUrl, response.headers.location);
                asyncGetLoop(newUrl);
            } else {
                operation.yield(shortenedUrl)
            }
        });
        
        request.on('error', function(error) {
            /* error during request or response */
            operation.yield();
        });
    };
    asyncGetLoop(shortenedUrl);
    
    return operation;
};

var main = function(shortenedUrl) {
    return asyncGet(shortenedUrl)
        .addCallback(function(result) { console.log('resolved: ' + result); });
};

if (require.main === module) {
    main.apply(this, process.argv.slice(2));
}

module.exports = main;
