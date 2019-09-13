# Introduction

This is a JavaScript utility to trace the original URL of a shortened URL (or any URL with redirection).

# Usage

## Via Command-Line

**`node trace.js http://example.com/shortened-URL-you-want-to-resolve`**

You can invoke trace.js via command-line with one URL you want to look up, for example:

```
> node trace.js http://catchen.biz/home.en.html
resolving: http://catchen.biz/
resolving: https://catchen.me/
resolved: https://catchen.me/
```

## As an NPM Package

**`await require('traceurl').promisified.trace('http://example.com/shortened-URL-you-want-to-resolve');`**

You can install traceurl via [NPM](http://npmjs.org/):

```
npm install traceurl
```

Then you can use it as in your project, for example:

```
const traceurl = require('traceurl');
const resolvedURL = await traceurl.promisified.trace('http://catchen.biz/home.en.html');
console.log(resolvedURL);
```

If multiple redirections are involved, `trace` function will give you the final non-redirecting URL while `traceHops` function will give you a list of all involving URLs:

```
const traceurl = require('traceurl');
const hops = await traceurl.promisified.traceHops('http://catchen.biz/home.en.html');
console.log(hops);
```

## Legacy API

The legacy API uses Async module from [jsHelpers](http://catchen.github.com/jsHelpers/), which was a Promise-like utility before Promise. It uses the `addCallback` method in a way that's similar to `Promise`'s `then` method. We keep to legacy API to prevent breaking change.

```
const traceurl = require('traceurl');
traceurl.trace('http://catchen.biz/home.en.html').addCallback(function(resolvedURL) {
  console.log(resolvedURL);
});
traceurl.traceHops('http://catchen.biz/home.en.html').addCallback(function(hops) {
  console.log(hops);
});
```
