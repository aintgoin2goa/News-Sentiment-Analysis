var vm = require('vm');
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var Q = require('q');
var fakeArticle = require('../helpers/fakeArticle');
var Article = require('../../src/models/article.js');


describe.only('Database', function(){

    var sandbox, database, databaseScript, globalMocks;

    function saveArticle(){
        var dfd = Q.defer();
        var article = fakeArticle();
        database.connect().then(function(){
           database.saveArticle(article).then(function(){
              dfd.resolve();
           }, function(err){
               dfd.reject(err);
           });
        });
        return dfd.promise;
    }

    before(function(){
        sandbox = vm.createContext();
        sandbox.require = require;
        sandbox.process = {env : {}};
        sandbox.process.env['NSE_DBNAME'] = 'nse_test';
        sandbox.module = {exports : {}};
        globalMocks = {};
        var requireFake = function(module){
            var _require = require;
            if(module in globalMocks){
                return globalMocks[module];
            }else{
                if(module.indexOf('./') === 0){
                    return _require('../../src/' + module);
                }else{
                    return _require(module);
                }
            }
        };
        sandbox.require = requireFake;
        var databasePath =  path.resolve('./src/database.js');
        databaseScript = fs.readFileSync(databasePath, {encoding:'utf8'});

    });

    beforeEach(function(){
        this.timeout(5000);
        vm.runInNewContext(databaseScript, sandbox, 'database,js');
    });

    afterEach(function(){
        new Article().collection.drop();
    });

    it("Should connect to the database", function(done){
        this.timeout(5000);
        database = sandbox.module.exports;
        database.connect().then(
            function(){
                expect(true).to.equal(true);
                done();
            },
            done
        );
    });

    it('Should save a new article to the database', function(done){
        this.timeout(5000);
        database = sandbox.module.exports;
        saveArticle().then(
            function(){
                Article.find({}, function(err, results){
                    if(err){
                        done(err);
                        return;
                    }

                    expect(results.length).to.equal(1);
                    done();
                })
            },
           done
        );
    });

    it('Should check if an article exists in the database', function(){


    });



    it('Should check if a given url exists in the database');

    it('Should be a ble to save a new word to the database');

    it('Should update the count field if saving an exiting word');


});