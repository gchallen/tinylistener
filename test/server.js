var chai = require('chai'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    server = require('../server.js');

var assert = chai.assert;
chai.use(require('chai-http'));

describe('tiny-listener', function () {
  it('should handle well-formed travis posts correctly', function (done) {
    var src = 'test/fixtures/travis/correct';
    var bodies = _.map(fs.readdirSync(src), function (file) {
      return JSON.parse(fs.readFileSync(path.join(src, file)));
    });
    async.each(bodies, function (body, callback) {
      chai.request(server().app)
        .post('/notifications')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          payload: JSON.stringify(body)
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          callback();
        });
    }, function (err) {
      done(err);
    });

  });
});

// vim: ts=2:sw=2:et
