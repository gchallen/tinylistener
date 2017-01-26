var _ = require('underscore'),
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
  
  this.app = express();
  app.use(body_parser.urlencoded({extended: true}));
  app.post(/.*/, function (req, res) {
    if (config.verbose) {
      console.log(decodeURIComponent(req.body.payload));
    }
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
