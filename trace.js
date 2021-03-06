const http = require('http');
const https = require('https');
const url = require('url');

const Async = require('jshelpers').Async;

var urlToOptions = function(shortenedUrl) {
  var parsedUrl = url.parse(shortenedUrl);
  var protocol = parsedUrl.protocol.match(/^(.*):$/)[1];
  var host = (parsedUrl.auth ? parsedUrl.auth : '') + parsedUrl.hostname;
  var port =
    parsedUrl.port ||
    (protocol == 'http' ? 80 : protocol == 'https' ? 443 : NaN);
  var path = parsedUrl.pathname + (parsedUrl.search ? parsedUrl.search : '');
  return {
    protocol: protocol,
    host: host,
    port: port,
    path: path,
  };
};

var isSameOptions = function(options1, options2) {
  return (
    options1.protocol === options2.protocol &&
    options1.host === options2.host &&
    options1.port === options2.port &&
    options1.path === options2.path
  );
};

var asyncGet = function(shortenedUrl, recursion) {
  var operation = new Async.Operation();
  var optionsList = [];
  var results = [];

  var asyncGetLoop = function(shortenedUrl) {
    results.push(shortenedUrl);
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

    var request = protocol.get(shortenedUrl, function(response) {
      if (
        response.statusCode >= 200 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        var relativeUrl = response.headers.location;
        var absoluteUrl = new URL(relativeUrl, shortenedUrl).toString();
        var newUrl = url.resolve(shortenedUrl, absoluteUrl);
        if (recursion) {
          asyncGetLoop(newUrl);
        } else {
          operation.yield(results);
        }
      } else {
        operation.yield(results);
      }
    });

    request.on('error', function(error) {
      /* error during request or response */
      operation.yield(results);
    });
  };
  asyncGetLoop(shortenedUrl);

  return operation;
};

var main = function(shortenedUrl) {
  return Async.chain()
    .next(function() {
      return asyncGet(shortenedUrl, true);
    })
    .next(function(results) {
      var finalResult = results[results.length - 1];
      console.log('resolved: ' + finalResult);
      return finalResult;
    })
    .go();
};

main.trace = function(shortenedUrl, recursion = true) {
  return Async.chain()
    .next(function() {
      return asyncGet(shortenedUrl, recursion);
    })
    .next(function(results) {
      var finalResult = results[results.length - 1];
      console.log('resolved: ' + finalResult);
      return finalResult;
    })
    .go();
};

main.traceHops = function(shortenedUrl, recursion = true) {
  return asyncGet(shortenedUrl, recursion).addCallback(function(results) {
    var finalResult = results[results.length - 1];
    console.log('resolved: ' + finalResult);
  });
};

main.promisified = {
  trace: function(shortenedUrl, recursion = true) {
    return new Promise((resolve, reject) => {
      main.trace(shortenedUrl, recursion).addCallback((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to trace'));
        }
      });
    });
  },

  traceHops: function(shortenedUrl, recursion = true) {
    return new Promise((resolve, reject) => {
      main.traceHops(shortenedUrl, recursion).addCallback((results) => {
        if (results.length > 0) {
          resolve(results);
        } else {
          reject(new Error('Failed to trace'));
        }
      });
    });
  },
};

if (require.main === module) {
  main.apply(this, process.argv.slice(2));
}

module.exports = main;
