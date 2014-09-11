var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');

describe('Config', function(){

    var config;

    var keywordText = fs.readFileSync('./config/keywords.txt', {encoding:'utf8'});

    beforeEach(function(){
        config = loader.loadModule('src/config.js', 'config.js').module.exports;
    });

    it('Should load in a list of keywords from a flat file', function(done){
        config.loadKeywords().then(function(keywords){
            try{
                keywords.forEach(function(keyword){
                    expect(keywordText).to.contain(keyword);
                });
                done();
            }catch(e){
                done(e);
            }

        }, done);
    });

    it.only('Should load in all publications from the config file', function(done){
        config.loadPublications()
    });

});