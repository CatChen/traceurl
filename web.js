const express = require('express');
const path = require('path');

const trace = require('traceurl');

const viewsDirectory = path.join(__dirname, 'views');

var app = express();

app.use(require('morgan')('combined'));
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('errorhandler')());

app.engine("mustache", require('mustache-express')());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, 'views'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/resolve.:format?', function(request, response) {
    console.log('format = ' + (request.params.format || 'html'));
    if (request.query.hops === 'true') {
        trace.traceHops(request.query.url)
            .addCallback(function(results) {
                var json = { urls: results };
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
    } else {
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
    }
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Listening on " + port);
});
