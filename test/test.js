"use strict";
var sc = require('../lib/index');
var request = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var PORT = 31241;
describe('Site container', function () {
    var server;
    beforeEach(function (done) {
        var app = sc.site_container_create("./site");
        server = app.listen(PORT, done);
    });
    afterEach(function () {
        server.close();
    });
    describe('domains', function () {
        it('should get default file for  http://www.test.com/', function (done) {
            request.get("http://localhost:" + PORT + "/").set("Host", "www.test.com").end(function (e, r) {
                console.log(r.text);
                expect(r.text).contains("hello from www.test.com");
                done(e);
            });
        });
        it('should get default file for  http://test.com/', function (done) {
            request.get("http://localhost:" + PORT + "/").set("Host", "test.com").end(function (e, r) {
                expect(r.text).contains("hello from www.test.com");
                done(e);
            });
        });
        it('should get file by full uri http://www.test.com/index.htm', function (done) {
            request.get("http://localhost:" + PORT + "/index.htm").set("Host", "www.test.com").end(function (e, r) {
                expect(r.text).contains("hello from www.test.com");
                done(e);
            });
        });
        it('should get default file for  http://test.com/subfolder/', function (done) {
            request.get("http://localhost:" + PORT + "/subfolder/").set("Host", "test.com").end(function (e, r) {
                expect(r.text).contains("hello subfolder from www.test.com");
                done(e);
            });
        });
        it('should get file by full uri http://www.test.com/subfolder/index.htm', function (done) {
            request.get("http://localhost:" + PORT + "/subfolder/index.htm").set("Host", "www.test.com").end(function (e, r) {
                expect(r.text).contains("hello subfolder from www.test.com");
                done(e);
            });
        });
        it('should get file by localhost uri http://locahost/', function (done) {
            request.get("http://localhost:" + PORT + "/").end(function (e, r) {
                expect(r.text).contains("hello from localhost");
                done(e);
            });
        });
    });
});

//# sourceMappingURL=test.js.map
