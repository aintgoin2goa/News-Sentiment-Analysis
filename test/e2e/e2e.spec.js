// Full automated E2E test, make sure mongo is running
process.env["NSE_DBNAME"] = 'nse_test';

var Article = require('../../src/models/article.js');
var Word = require('../../src/models/word.js');
var Keyword = require('../../src/models/keyword.js');
var Publication = require('../../src/models/publication.js');

var child_process = require('child_process'),
    exec = child_process.exec,
    fork = child_process.fork;

var expect = require('chai').expect;

var path = require('path');

describe('NSE E2E Test', function(){

    before(function(done){
        this.timeout(60*1000);
        exec('node src/seed.js', {env : {'NSE_DB_NAME' : 'nse_test'}}, function(e){
            console.log('Seed complete', arguments);
            done();
        });
    });

    after(function(){
        new Article().collection.drop();
        new Word().collection.drop();
        new Keyword().collection.drop();
        new Publication().collection.drop();
    });

    it('Should run, grab content and save it in the DB', function(done){

        this.timeout(6*60*1000);
        var cwd = path.resolve('./src/');
        var p = fork('./src/update-all.js', {cwd:cwd});

        p.on('error', done);
        p.on('exit', function(code){

            console.log('update-all.js Process exited', code);
            if(code !== 0){
                done(new Error('Something went wrong...'))
                return;
            }


            // there should be at least one new article for each publication
            Publication.find({}, function(err, publications){
                if(err){
                    done(err);
                }
               publications.forEach(function(publication, i){
                  Publication.where({'publication':publication}).count(function(err, count){
                      if(err){
                          done(err);
                      }

                      expect(count).to.be.greaterThan(0);

                      if(i === publications.length-1){
                          done();
                      }

                   });
               });
            });
        });
    });
});
