/*
 * Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jshint node:true */
'use strict';

var fs = require('fs');
var path = require('path');
var argv = require('yargs').argv;
var FakeResponse = require('./fakeresponse.js');

// Preload routes 
FakeResponse.preload(argv.configDir);

var controller = {
    fakeResponse: FakeResponse, // of course this is here just so that it can be overwritten easily in the tests.

    add: function (req, res, next) {
        var obj = {
            delay: req.params.delay,
            at: req.params.at,
            route: req.params.route,
            responseCode: req.params.responseCode,
            responseBody: decodeURIComponent(req.params.responseBody.replace(/&quot;/g, '"')),
        };

        controller.fakeResponse.add(obj);

        res.send(200, 'OK');
        next();
    },

    match: function (req, res, next) {
        var bestMatch = controller.fakeResponse.match(req.url);

        if (bestMatch) {
            res.setHeader('Content-type', 'text/plain'); // overwrites default octetstream header.

            if(bestMatch.responseData) {
                fs.readFile(path.join(__dirname, bestMatch.responseData),'utf8', function(err, data) {
                    if (err) {
                        res.send(500, "FAKE-SERVER is misconfigured");
                    }
                    res.send(parseInt(bestMatch.responseCode, 10), data);
                });
            } else {
                res.send(parseInt(bestMatch.responseCode, 10), bestMatch.responseBody);
            }

            if (bestMatch.delay) {
                setTimeout(next, bestMatch.delay);
            } else {
                next();
            }
        } else {
            res.send(404, 'no match!');
            next();
        }
    },

    flush: function (req, res, next) {
        controller.fakeResponse.flush();
        res.send(200, 'OK');
        next();
    }
};

module.exports = controller;
