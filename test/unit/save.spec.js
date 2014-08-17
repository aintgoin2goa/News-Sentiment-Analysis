var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var vm = require('vm');
var sandbox = vm.createContext();
var savePath = path.resolve('./src/save.js');
var saveScript = fs.readFileSync(savePath, {encoding:'utf8'});
var argvBase = ['node', savePath];
sandbox.process = {argv : argvBase};
sandbox.system = {stdout:{write:sinon.spy()},stderr:{write:sinon.spy()}};
var globalMocks = {};
var requireFake = function(module){
    var _require = require;
    if(module in globalMocks){
        return globalMocks[module];
    }else{
        return _require(module);
    }
};
sandbox.require = requireFake;
globalMocks['./database.js'] = sinon.spy();
var testData = fs.readFileSync('test/test-analysis-result1.txt', {encoding:'utf8'});
sandbox.process.argv.push(testData);

describe("Save", function(){

    it('Should save a new article to the database', function(){
        sandbox.process.exit = function(exitCode){
            expect(exitCode).to.equal(0);
            assert(globalMocks['./database.js'].saveArticle.called);
        };
        vm.runInNewContext(saveScript, sandbox, 'save.js');
    });

    it('Should update the article if it already exists');

    it('Should save a word to the words collection');

    it('Should update the count if the word already exists');

});
