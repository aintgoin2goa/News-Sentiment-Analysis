var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var findUrls = path.resolve('./src/findUrls.js');
var script = fs.readFileSync(findUrls, {encoding:'utf8'});
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
sandbox.require = requireFake;


describe("findUrls", function(){

    afterEach(function(){
        globalMocks = {};
    });

    it("should run phantomjs directly from it's own bin file", function(done){
        var spy = sinon.spy();
        var phantomPath = path.resolve('../../bin/phantomjs');
        globalMocks["child_process"] = {
            spawn : spy
        };

        exec('node ' + findUrls, function(){
            assert(spy.calledWith(phantomPath), 'expected spy to be called with ' + phantomPath);
            done();
        });
    });

    it.skip("should start phantomjs with the correct script");

    it.skip("should listen on the stdout for a response");

    it.skip("expects an array of strings in the response");

    it.skip("should return the array of urls using it's own stdout");

    it.skip("should listen on stderr for any errors");

    it.skip("should return any errors using it's won stdout");
});
