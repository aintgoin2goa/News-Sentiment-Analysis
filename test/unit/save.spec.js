describe
("Save", function(){

    var sinon = require('sinon');
    var assert = require('assert');
    var expect = require('chai').expect;
    var path = require('path');
    var fs = require('fs');
    var Q = require('q');
    var loader = require('../helpers/moduleLoader.js');

    var testData = fs.readFileSync('test/data/test-analysis-result1.txt', {encoding:'utf8'});
    var testDataObj = JSON.parse(testData);

    var save, databaseMock;

    beforeEach(function(done){
        this.timeout(10000);
        databaseMock = {
            connect : sinon.stub().returns(Q(null)),
            hasArticle : sinon.stub().returns(Q(false)),
            saveArticle : sinon.stub().returns(Q(null)),
            saveOrUpdateWord : sinon.stub().returns(Q(null)),
            updatePublication : sinon.stub().returns(Q(null))
        };
        save = loader.loadModule('src/save.js', {'./database.js' : databaseMock}, 'save.js').module.exports;
        done();
    });


    it('Should save a new article to the database', function(done){
        save(testData).then(function(){
            assert(databaseMock.saveArticle.called);
            done();
        }, function(){
            done(new Error("Fail callback fired"));
        });
    });

    it('Should not save the article if it already exists', function(done){
        databaseMock.hasArticle.returns(Q(true));
        save(testData).then(function(){
            try{
                expect(databaseMock.saveArticle.callCount).to.equal(0);
                done();
            }catch(e){
                done(e);
            }

        }, function(e){
            done(e);
        });
    });

    it('Should update the words collection', function(done){
        var words = testDataObj.words.positive.concat(testDataObj.words.negative);
        save(testData).then(function(){
            assert(databaseMock.saveOrUpdateWord.callCount === words.length);
            done();
        }, function(){
            done(new Error("Fail callback fired"));
        });

    });

    it('Should update the publication object with the new score and article count', function(done){
        save(testData).then(function(){
            try{
                assert(databaseMock.updatePublication.calledWith(testDataObj.article.publication, 1, testDataObj.article.analysis.score));
                done();
            }catch(e){
                done(e);
            }

        }, function(e){
            done(e);
        })
    });
});
