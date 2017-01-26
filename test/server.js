var chai = require('chai'),
    server = require('../server.js');

chai.use(require('chai-http'));

describe('tiny-listener', function () {
  it('should handle well-formed travis posts correctly', function (done) {
    chai.request(server().app)
      .post('/notifications')
      .end(function (err, res) {
        expect(res).to.have.status(200);
      });
  });
});

// vim: ts=2:sw=2:et
