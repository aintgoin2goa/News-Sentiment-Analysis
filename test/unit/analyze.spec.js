var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');

var analyze = loader.loadModule('src/analyze.js').module.exports;


describe("Analyze", function(){


    it("Should accept a string of content as an argument and perform sentiment anaysis on it", function(done){
        var content = fs.readFileSync('test/data/guardian-test-content1.txt', {encoding:'utf8'});
        var result = analyze(content);

        try{
            result = JSON.parse(result);
            expect(result.article.analysis.score).to.equal(-47);
            done();
        }catch(e){
            done(e);
        }
    });
});