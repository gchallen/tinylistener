var _ = require('underscore'),
    async = require('async'),
    child_process = require('child_process'),
    express = require('express'),
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
  _.each(config.repos, function (command, name) {
    queues[name] = async.queue(function (payload, callback) {
      child_process.exec(command, function (err) {
        if (err && config.verbose) {
          console.log("Command failed: " + err);
        }
        callback();
      });
    }, 1);
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
    if (!(payload.repository.url in config.repos)) {
      if (config.verbose) {
        console.log("Repository not registered: " + payload.repository.url);
      }
      res.status(404).send();
      return;
    }
    queues[payload.repository.url].push(payload);
    res.status(200).send();
  });
  
  this.start = function() {
    app.listen(config.port);
  }

  return this;
}

if (require.main === module) {
  var argv = require('minimist')(process.argv.slice(2)),
      fs = require('fs');
  server(JSON.parse(fs.readFileSync(argv._[0]))).start();
}

exports = module.exports = server

// vim: ts=2:sw=2:et
