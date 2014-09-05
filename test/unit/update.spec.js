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

    beforeEach(function(){
        var executeStub = sinon.stub().returns(Q(testContent));
        executeStub.onCall(0).returns(Q(JSON.stringify(urls)));
        phantomWrapperMock = {execute : executeStub};
        PhantomWrapperConstructorMock = sinon.stub().returns(phantomWrapperMock);
        filterMock = sinon.stub().returns(Q(JSON.stringify(urls)));
        saveMock = sinon.stub().returns(Q(null));
        analyzeMock = sinon.stub().returns(analysisResult);
        update = loader.loadModule('src/update.js',
            {'./phantomWrapper.js' : PhantomWrapperConstructorMock, './filter.js' : filterMock, './save.js':saveMock}, 'update.js').module.exports;
    });

    it.only('Should take a publication id and keyword and pass that to to phantomjs to crawl', function(done){
        this.timeout(10000);
        var publication = 'publication',
            keyword = 'keyword';
        debugger;
        update(publication, keyword).then(function(){
            expect(phantomWrapperMock.execute.firstCall.args[1]).to.equal(publication);
            expect(phantomWrapperMock.execute.firstCall.args[2]).to.equal(keyword);
            done();
        }, done);
    });

    it('Should pass the results of a crawl onto the filter modules');

    it('Should take the filtered list of urls and use phantom js to extract the content');

    it('Should call analyze() for each piece of returned content');

    it('Should pass the results of each analysis to the save() module');

});
