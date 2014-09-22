var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');

describe("updatePublication", function(){

    var updateMock, updatePublication, databaseMock;

    var keywords = [
        "economy",
        "israel",
        "cameron",
        "isis",
        "ukraine",
        "obama"
    ];

    var publication = 'guardian';

    var articleCount = 100;
    var addedCount = 5;

    beforeEach(function(){
        updateMock = sinon.stub().returns(Q(addedCount));
        databaseMock = {articleCount : sinon.stub().returns(Q(articleCount)), allKeywords: sinon.stub().returns(Q(keywords))};
        updatePublication = loader.loadModule(
            'src/update-publication.js',
            {'./update.js' : updateMock, './database.js' : databaseMock},
            'update-publication.js'
        ).module.exports;
    });

   it('Should get all keywords from the database', function(done){
        updatePublication(publication).then(function(){
            try{
                assert(databaseMock.allKeywords.called);
                done();
            }catch(e){
                done(e);
            }
        }, done);
   });

    it('Should call update.js for for each keyword', function(done){
        updatePublication(publication).then(function(){
            try{
                debugger;
                expect(updateMock.callCount).to.equal(keywords.length);
                for(var i= 0, l=keywords.length; i<l; i++){
                    expect(updateMock.args[i][1]).to.equal(keywords[i]);
                }
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should return the number of new articles added to the database and total article for that publication', function(done){
        updatePublication(publication).then(function(stats){
            stats = JSON.parse(stats);
            try{
               expect(stats.added).to.equal(addedCount * keywords.length);
                expect(stats.total).to.equal(articleCount);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

});