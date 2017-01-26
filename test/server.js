var chai = require('chai'),
    server = require('..');

chai.use(require('chai-http'));

describe('tiny-listener', function () {
  it('should handle well-formed travis posts correctly', function (done) {
    chai.request(server)
      .post('/notifications')
      .end(function (err, res) {
        assert(res.
        res.
// vim: ts=2:sw=2:et
