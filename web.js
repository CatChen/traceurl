const express = require('express');
const fs = require('fs');
const path = require('path');

const trace = require('traceurl');

const viewsDirectory = path.join(__dirname, 'views');

var getViewFileName = function(viewName) {
    return path.join(viewsDirectory, viewName + '.mustache');
};

var getViewFile = function(viewName) {
    return fs.readFileSync(getViewFileName(viewName)).toString();
};

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

app.set("view engine", "mustache");
app.set("views", __dirname + '/views/');
app.register(".mustache", require('stache'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/resolve', function(request, response) {
    trace(request.query.url)
        .addCallback(function(result) {
            response.render('resolve', { url: result });
        });
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Listening on " + port);
});
