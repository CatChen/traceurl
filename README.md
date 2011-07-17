# Introduction

This is a JavaScript utility to trace the original url of a shortened url.

# Usage

## Via Command-Line

`node trace.js http://example.com/shortened-url-you-want-to-resolve`

You can invoke trace.js via command-line with one URL you want to look up, for example:

    node trace.js http://catchen.me

## As Package

`var resolvedUrl = require('traceurl')('http://example.com/shortened-url-you-want-to-resolve');`

You can install traceurl via [NPM](http://npmjs.org/):

    npm install traceurl

Then you can use it as in your project, for example:

    const traceurl = require('traceurl');
    traceurl('http://catchen.me').addCallback(function(resolvedUrl) {
        console.log(resolvedUrl);
    });

Please note that traceurl uses [jsHelpers](http://catchen.github.com/jsHelpers/) Async module thus use the `addCallback` method on the return value to provide callback from asynchronous operation.
