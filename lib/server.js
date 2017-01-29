var _ = require('underscore'),
    async = require('async'),
    child_process = require('child_process'),
    handlebars = require('handlebars'),
    tempfile = require('tempfile'),
    jsonfile = require('jsonfile'),
    express = require('express'),
    assert = require('assert'),
    body_parser = require('body-parser');

function server(config) {
  var defaults = {
    'port': 3000,
    'verbose': false
  }
  var config = _.extend(_.clone(defaults), config || {});
  if (config.verbose) {
    console.log(config);
  }

  var queues = {};
  _.each(config.repos, function (repo, url) {
    queues[url] = async.queue(function (payload, callback) {
      if (payload) {
        var jsonFile = tempfile('.json');
        jsonfile.writeFileSync(jsonFile, payload);
        payload.file = jsonFile;
        var command = handlebars.compile(repo.command)(payload);
      } else {
        var command = handlebars.compile(repo.command)({});
      }
      if (config.verbose) {
        console.log("Running " + command);
      }
      child_process.exec(command, function (err) {
        if (config.verbose) {
          if (err) {
            console.log("Command failed: " + err);
          } else {
            console.log("Command succeeded");
          }
        }
        callback();
      });
    }, 1);
    if (repo.start) {
      queues[url].push();
    }
  });


  this.app = express();
  app.use(body_parser.urlencoded({extended: true}));
  app.post(/.*/, function (req, res) {
    var payload = decodeURIComponent(req.body.payload);
    if (config.verbose) {
      console.log(payload);
    }

    try {
      payload = JSON.parse(payload);
    } catch (err) {
      if (config.verbose) {
        console.log("Error parsing payload: " + err);
      }
      res.status(500).send();
      return;
    }
    try {
      var url = parseURL(payload);
      assert(url in config.repos);
    } catch (err) {
      if (config.verbose) {
        console.log("Repository not registered: " + url);
      }
      res.status(404).send();
      return;
    }
    try {
      var branch = parseBranch(payload);
      assert(branch);
    } catch (err) {
      if (config.verbose) {
        console.log("Couldn't parse branch from payload");
      }
      res.status(500).send();
      return;
    }
    var normalizedInfo = {
      commit: payload.commit || payload.head_commit.id,
      branch: branch,
      message: payload.message || payload.head_commit.message,
      author_name: payload.author_name || payload.head_commit.author.name,
      author_email: payload.author_email || payload.head_commit.author.email,
      timestamp: payload.committed_at || payload.head_commit.timestamp
    }
    queues[url].push(normalizedInfo);
    res.status(200).send();
  });

  this.start = function() {
    app.listen(config.port);
  }

  return this;
}

var branchPattern = /^refs\/heads\/(\w+)$/;
var parseBranch = function (payload) {
  return payload.branch || branchPattern.exec(payload.ref)[1];
}

var repoURLPattern = /^(.*?)\/compare\/.*$/;
var parseURL = function (payload) {
  return repoURLPattern.exec(payload.compare || payload.compare_url)[1];
}

exports = module.exports = server
exports.parseURL = parseURL

// vim: ts=2:sw=2:et
