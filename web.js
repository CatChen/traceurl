const express = require('express');
const fs = require('fs');
const path = require('path');

const trace = require('traceurl');

const viewsDirectory = path.join(__dirname, 'views');

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

app.set("view engine", "mustache");
app.set("views", path.join(__dirname, 'views'));
app.register(".mustache", require('stache'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/resolve.:format?', function(request, response) {
    console.log('format = ' + (request.params.format || 'html'));
    trace(request.query.url)
        .addCallback(function(result) {
            var json = { url: result || '' };
            switch (request.params.format) {
                case 'json':
                    response.contentType('application/json');
                    response.render('resolve.json.mustache', { json: JSON.stringify(json) });
                    break;
                case 'xml':
                    response.contentType('application/xml');
                    response.render('resolve.xml.mustache', json);
                    break;
                case 'html':
                case undefined:
                    if (!request.header('X-Requested-With')) {
                        response.render('resolve', json);
                    } else {
                    }
                    break;
                default:
                    response.send(404);
                    break;
            }
        });
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Listening on " + port);
});
