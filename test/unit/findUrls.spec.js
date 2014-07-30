var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var vm = require('vm');
var FakeChildProcess = require('../helpers/fakeChildProcess.js');

var findUrlsPath = path.resolve('./src/findUrls.js');
var findUrlsScript = fs.readFileSync(findUrlsPath, {encoding:'utf8'});
var sandbox = vm.createContext();
var globalMocks = {};
var requireFake = function(module){
    var _require = require;
    if(module in globalMocks){
        return globalMocks[module];
    }else{
        return _require(module);
    }
};
var argvBase = ['node', findUrlsPath];
sandbox.require = requireFake;
sandbox.module = {exports:{}};
sandbox.require.main = sandbox.module;
sandbox.__dirname = findUrlsPath.replace('findUrls.js', '');
sandbox.process = {argv : argvBase};
describe("findUrlsPath", function(){

    afterEach(function(){
        globalMocks = {};
        sandbox.process.argv = argvBase;
        stub = null;
        fakeProcess = null;
    });

    var scriptPath = path.resolve('./src/phantom/crawl.js');
    var adaptor = "guardian";
    var keyword = "economy";
    var stub, fakeProcess;

    var setup = function(){
        stub = sinon.stub();
        fakeProcess = new FakeChildProcess();
        stub.returns(fakeProcess);
        globalMocks["child_process"] = {
            spawn : stub
        };
        sandbox.process.argv = sandbox.process.argv.concat([scriptPath, adaptor, keyword]);
    };

    it("should run phantomjs directly from it's own bin file", function(){
        var phantomPath = path.resolve('./bin/phantomjs');
        setup();

        vm.runInNewContext(findUrlsScript, sandbox, 'findUrls_proxy.js');
        assert(stub.calledWith(phantomPath), 'expected spawn to be called with ' + phantomPath);
    });

    it("should start phantomjs with the correct script, adaptor and keyword", function(){
        setup();

        vm.runInNewContext(findUrlsScript, sandbox, 'findUrls_proxy.js');
        assert(stub.called, 'expected spawn to have been called');
        var args = stub.lastCall.args;
        expect(args[1][0]).to.equal(scriptPath);
        expect(args[1][1]).to.equal(adaptor);
        expect(args[1][2]).to.equal(keyword);
    });

    it("should listen on the stdout for a response and return it via it's own stdout", function(done){
       setup();
        var spy = sinon.spy();
        sandbox.process.stdout = {write : spy};
        vm.runInNewContext(findUrlsScript, sandbox, 'findUrls_proxy.js');
        fakeProcess.stdout.write(JSON.stringify([]));
        setImmediate(function(){
            assert(spy.called, "expected stdout.write to have been called");
           var response = spy.lastCall.args[0];
            expect(response).to.exist;
            done();
        });
    });

    it("should listen on stderr for any errors, returning them via it's own stderr", function(done){
        setup();
        var spy = sinon.spy();
        var error = 'Something went wrong';
        sandbox.process.stderr = {write : spy};
        vm.runInNewContext(findUrlsScript, sandbox, 'findUrls_proxy.js');
        fakeProcess.stderr.write(error);
        setImmediate(function(){
            assert(spy.called, "expected stderr.write to have been called");
            var response = spy.lastCall.args[0];
            expect(response).to.exist;
            expect(response).to.equal(error);
            done();
        });
    });

});
