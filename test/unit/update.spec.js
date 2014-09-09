var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');

var urls = [
    "http://www.url1.com",
    "http://www.url2.com",
    "http://www.url3.com"
];

var analysisResult = fs.readFileSync('./test/data/test-analysis-result1.txt', {encoding:'utf8'});
var testContent = fs.readFileSync('./test/data/guardian-test-content1.txt', {encoding:'utf8'});

describe('Update', function(){

    var PhantomWrapperConstructorMock, phantomWrapperMock, filterMock, saveMock, update, analyzeMock;

    var publication = 'publication',
        keyword = 'keyword';

    beforeEach(function(){
        var executeStub = sinon.stub().returns(Q(testContent));
        executeStub.onCall(0).returns(Q(JSON.stringify(urls)));
        phantomWrapperMock = {execute : executeStub};
        PhantomWrapperConstructorMock = sinon.stub().returns(phantomWrapperMock);
        filterMock = sinon.stub().returns(Q(JSON.stringify(urls)));
        saveMock = sinon.stub().returns(Q(null));
        analyzeMock = sinon.stub().returns(analysisResult);
        update = loader.loadModule('src/update.js',
            {'./phantomWrapper.js' : PhantomWrapperConstructorMock, './filter.js' : filterMock, './save.js':saveMock, './analyze.js' : analyzeMock}, 'update.js').module.exports;
    });

    it('Should take a publication id and keyword and pass that to to phantomjs to crawl', function(done){

        update(publication, keyword).then(function(){
            expect(phantomWrapperMock.execute.firstCall.args[1]).to.equal(publication);
            expect(phantomWrapperMock.execute.firstCall.args[2]).to.equal(keyword);
            done();
        }, done);
    });

    it('Should pass the results of a crawl onto the filter modules', function(done){

        update(publication, keyword).then(function(){
            expect(filterMock.firstCall.args[0]).to.equal(JSON.stringify(urls));
            done();
        }, done);

    });

    it('Should take the filtered list of urls and use phantom js to extract the content', function(done){

        update(publication, keyword).then(function(){
            try{
                expect(phantomWrapperMock.execute.args[1][2]).to.equal(urls[0]);
                expect(phantomWrapperMock.execute.args[2][2]).to.equal(urls[1]);
                expect(phantomWrapperMock.execute.args[3][2]).to.equal(urls[2]);
                done();
            }catch(e){
                done(e);
            }
        }, done)
    });

    it('Should call analyze() for each piece of returned content', function(done){
        update(publication, keyword).then(function(){
            try{
                expect(analyzeMock.callCount).to.equal(urls.length);
                expect(analyzeMock.lastCall.args[0]).to.equal(testContent);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should pass the results of each analysis to the save() module', function(done){
        update(publication, keyword).then(function(){
            try{
                expect(saveMock.callCount).to.equal(urls.length);
                expect(saveMock.lastCall.args[0]).to.equal(analysisResult);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should return the total number of new articles added', function(done){
        update(publication, keyword).then(function(added){
            try{
                expect(added).to.equal(urls.length);
                done();
            }catch(e){
                done(e);
            }

        }, done);
    })

});
