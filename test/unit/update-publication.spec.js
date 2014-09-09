var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');

describe("updatePublication", function(){

    var updateMock, updatePublication, configMock, databaseMock;

    var keywords = [
        "economy",
        "israel",
        "cameron"
    ];

    var publication = 'guardian';

    var articleCount = 100;
    var addedCount = 5;

    beforeEach(function(){
        updateMock = sinon.stub().returns(Q(addedCount));
        configMock = {loadKeywords : sinon.stub().returns(Q(keywords))};
        databaseMock = {articleCount : sinon.stub().returns(Q(articleCount))};
        updatePublication = loader.loadModule(
            'src/update-publication.js',
            {'./update.js' : updateMock, './config.js': configMock, './database.js' : databaseMock},
            'update-publication.js'
        ).module.exports;
    });

    it("Should load in the keywords list", function(done){
        updatePublication(publication).then(function(){
            assert(configMock.loadKeywords.called);
            done();
        }, done);
    });

    it('Can call update.js with the current publication and each keyword', function(done){
        updatePublication(publication).then(function(){
            expect(updateMock.callCount).to.equal(keywords.length);
            expect(updateMock.args[0][1]).to.equal(keywords[0]);
            expect(updateMock.args[1][1]).to.equal(keywords[1]);
            expect(updateMock.args[2][1]).to.equal(keywords[2]);
            done();
        }, done);
    });

    it('Should return some stats for number updated and new total number of articles in db', function(done){
        updatePublication(publication).then(function(stats) {
            try{
                expect(stats.publication).to.equal(publication);
                expect(stats.added).to.equal(addedCount * keywords.length);
                expect(stats.total).to.equal(articleCount);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

});