describe
("Save", function(){

    var sinon = require('sinon');
    var assert = require('assert');
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
            saveOrUpdateWord : sinon.stub().returns(Q(null))
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

    it('Should not save the article if it already exists', function(){
        databaseMock.saveArticle.returns(Q(false));
        save(testData).then(function(){
            assert(databaseMock.saveArticle.callCount === 0);
            done();
        }, function(){
            done(new Error("Fail callback fired"));
        });
    });

    it('Should update the words collection', function(){
        var words = testDataObj.words.positive.concat(testDataObj.words.negative);
        save(testData).then(function(){
            assert(databaseMock.saveOrUpdateWord.callCount === words.length);
            done();
        }, function(){
            done(new Error("Fail callback fired"));
        });

    });
});
