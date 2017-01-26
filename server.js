var _ = require('underscore'),
    express = require('express');

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
  app.post(/.*/, function (req, res) {
    console.log("Here");
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
