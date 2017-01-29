var chai = require('chai'),
    _ = require('underscore'),
    fs = require('fs'),
    glob = require('glob'),
    path = require('path'),
    async = require('async'),
    wait_on = require('wait-on'),
    server = require('../lib/server.js');

var assert = chai.assert;
chai.use(require('chai-fs'));
chai.use(require('chai-http'));

var waitOpts = { interval: 100, timeout: 1000, window: 0 };
describe('tiny-listener', function () {
  it('should handle well-formed Travis posts correctly', function (done) {
    var bodies = {};
    var config = {
      verbose: false,
      repos: {}
    }
    var src = 'test/fixtures/travis/correct/*.json';
    var bodies = _.map(glob.sync(src), function (file) {
      var body = JSON.parse(fs.readFileSync(file));
      var checkPath = file.substr(0, file.lastIndexOf(".")) + "." + body.commit + ".finished";
      try { fs.unlinkSync(checkPath); } catch (e) {}
      assert.notPathExists(checkPath);
      config.repos[body.repository.url] = {
        command: "touch " + file.substr(0, file.lastIndexOf(".")) + "." + "{{ commit }}.finished"
      }
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
          var opts = _.clone(waitOpts);
          opts.resources = [ body.checkPath ];
          wait_on(opts, function (err) {
            callback(err);
          });
        });
    }, function (err) {
      done(err);
    });

  });
  it('should handle well-formed GitHub posts correctly', function (done) {
    var bodies = {};
    var config = {
      verbose: false,
      repos: {}
    }
    var src = 'test/fixtures/github/correct/*.json';
    var bodies = _.map(glob.sync(src), function (file) {
      console.log(file);
      var body = JSON.parse(fs.readFileSync(file));
      var checkPath = file.substr(0, file.lastIndexOf(".")) + "." + body.after + ".finished";
      try { fs.unlinkSync(checkPath); } catch (e) {}
      assert.notPathExists(checkPath);
      config.repos[body.repository.html_url] = {
        command: "touch " + file.substr(0, file.lastIndexOf(".")) + "." + "{{ commit }}.finished"
      }
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
          var opts = _.clone(waitOpts);
          opts.resources = [ body.checkPath ];
          wait_on(opts, function (err) {
            callback(err);
          });
        });
    }, function (err) {
      done(err);
    });

  });
});

// vim: ts=2:sw=2:et
