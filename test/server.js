var chai = require('chai'),
    _ = require('underscore'),
    fs = require('fs'),
    glob = require('glob-fs')({ gitignore: true }),
    path = require('path'),
    async = require('async'),
    server = require('../server.js');

var assert = chai.assert;
chai.use(require('chai-fs'));
chai.use(require('chai-http'));

describe('tiny-listener', function () {
  it('should handle well-formed travis posts correctly', function (done) {
    var bodies = {};
    var config = {
      verbose: true,
      repos: {}
    }
    var src = 'test/fixtures/travis/correct/*.js';
    var bodies = _.map(glob.readdirSync(src, {}), function (file) {
      var bodyPath = path.join(src, file);
      var body = JSON.parse(fs.readFileSync(path.join(src, file)));
      var checkPath = bodyPath.substr(0, bodyPath.lastIndexOf(".")) + ".finished";
      try { fs.unlinkSync(checkPath); } catch (e) {}
      assert.notPathExists(checkPath);
      config.repos[body.repository.url] = "touch " + checkPath;
      return {
        body: body,
        checkPath: checkPath
      }
    });
    async.each(bodies, function (body, callback) {
      chai.request(server(config).app)
        .post('/notifications')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          payload: encodeURIComponent(JSON.stringify(body.body))
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.pathExists(body.checkPath);
          callback();
        });
    }, function (err) {

      done(err);
    });

  });
});

// vim: ts=2:sw=2:et
