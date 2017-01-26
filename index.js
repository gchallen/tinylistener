#!/usr/bin/env node

var defaults = {
  'port': 3000,
  'verbose': false
}

var _ = require('underscore'),
    fs = require('fs'),
    argv = require('minimist')(process.argv.slice(2)),
    express = require('express');

var config = _.extend(_.clone(defaults), JSON.parse(fs.readFileSync(argv._[0])));
console.log(config);

app = express();

app.post(/.*/, function (req, res) {
  console.log("Here");
});

app.listen(config.port);

// vim: ts=2:sw=2:et
