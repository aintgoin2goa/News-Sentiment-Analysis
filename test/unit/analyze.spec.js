var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var vm = require('vm');
var sandbox = vm.createContext();
var analyzePath = path.resolve('./src/analyze.js');
var analyzeScript = fs.readFileSync(analyzePath, {encoding:'utf8'});
var argvBase = ['node', analyzePath];
sandbox.process = {argv : argvBase};
sandbox.require = require;

describe("Analyze", function(){

    var content;


    it("Should accept a string of content as an argument and perform sentiment anaysis on it", function(done){
        content = fs.readFileSync('test/data/guardian-test-content1.txt', {encoding:'utf8'});
        sandbox.process.argv.push(content);
        var spy = sinon.spy();
        sandbox.process.stdout = {write:spy};
        sandbox.process.exit = function(){
            try{
                assert(spy.called);
                var result = spy.lastCall.args[0];
                result = JSON.parse(result);
                expect(result.score).to.equal(-47);
                done();
            }catch(e){
                done(e);
            }
        };
        vm.runInNewContext(analyzeScript, sandbox, 'analyze.js');
    });


});