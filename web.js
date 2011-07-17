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

app.get('/', function(request, response) {
    var indexContent = getViewFile('index');
    response.setHeader("Content-Type", "text/html");
    response.send(indexContent);
});

app.get('/resolve', function(request, response) {
    response.setHeader("Content-Type", "text/html");
    trace(request.query.url)
        .addCallback(function(result) {
            var resolveContent = getViewFile('resolve');
            var options = { url: result };
            resolveContent = resolveContent.replace(/{{(.*?)}}/g, function(whole, match) { return options[match] ? options[match] : ''; });
            response.send(resolveContent);
        });
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Listening on " + port);
});
