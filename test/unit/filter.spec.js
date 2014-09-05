var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');


var filter, databaseMock;;

var urls = [
    "http://www.url1.com",
    "http://www.url2.com",
    "http://www.url3.com"
];


describe('Filter', function(){

    beforeEach(function(){
        databaseMock = sinon.mock(require('../../src/database.js'));
        filter = loader.loadModule('src/filter.js', {'./database.js' : databaseMock.object}, 'filter.js  ').module.exports;
        databaseMock.expects("connect").returns(Q(null));
    });

    afterEach(function(){
        databaseMock = null;
    });

    it('Should take an array of urls and check if there are already in the database', function(done){
        databaseMock.expects("hasUrl").exactly(urls.length);

        filter(JSON.stringify(urls)).then(function(){
            try{
                databaseMock.verify();
                expect(databaseMock.expectations.hasUrl[0].args[0][0]).to.equal(urls[0]);
                expect(databaseMock.expectations.hasUrl[0].args[1][0]).to.equal(urls[1]);
                expect(databaseMock.expectations.hasUrl[0].args[2][0]).to.equal(urls[2]);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it("Should return an array of urls not already in the database", function(done){
        debugger;
        var hasUrl = databaseMock.expects("hasUrl").exactly(urls.length);
        hasUrl.onCall(0).returns(Q(true));
        hasUrl.onCall(1).returns(Q(false));
        hasUrl.onCall(2).returns(Q(true));

        filter(JSON.stringify(urls)).then(function(filteredUrls){
            try{
                filteredUrls = JSON.parse(filteredUrls);
                debugger;
                databaseMock.verify();
                expect(filteredUrls.length).to.equal(2);
                expect(filteredUrls).not.to.contain(urls[1]);
                done();
            }catch(e){
                done(e);
            }

        }, done);
    });
});