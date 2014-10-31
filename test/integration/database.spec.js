var vm = require('vm');
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var Q = require('q');
var fakeArticle = require('../helpers/fakeArticle');
var Article = require('../../src/models/article.js');
var Word = require('../../src/models/word.js');
var Keyword = require('../../src/models/keyword.js');
var Publication = require('../../src/models/publication.js');


describe('Database', function(){

    var database;

    function saveArticle(){
        var dfd = Q.defer();
        var article = fakeArticle();
        database.connect().then(function(){
           database.saveArticle(article).then(function(){
              dfd.resolve();
           }, function(err){
               console.log(err);
               dfd.reject(err);
           });
        });
        return dfd.promise;
    }

    before(function(){
        process.env["NSE_DBNAME"] = 'nse_test';
        database = require('../../src/database.js');
    });

    beforeEach(function(){
        this.timeout(5000);
    });

    afterEach(function(){
        new Article().collection.drop();
        new Word().collection.drop();
        new Keyword().collection.drop();
        new Publication().collection.drop();
        return database.disconnect();
    });

    it("Should connect to the database", function(done){
        this.timeout(5000);
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
        saveArticle().then(function(){
            Article.find({}, function(err, results){
                if(err){
                    done(err);
                    return;
                }
                expect(results.length).to.equal(1);
                done();
            });
        },done);
    });

    it('Should check if an article exists in the database', function(done){
        this.timeout(5000);
        saveArticle().then(function() {
            database.hasArticle(fakeArticle()).then(function(result){
                expect(result).to.equal(true);
                done();
            }, done);
        }, done);
    });

    it('Should check if a given url exists in the database', function(done){
        this.timeout(5000);
        saveArticle().then(function() {
            database.hasUrl('http://publication.com/').then(function(result){
                expect(result).to.equal(true);
                done();
            }, done);
        }, done);
    });

    it('Should be able to save a new word to the database', function(done){
        database.connect().then(function(){
            return database.saveOrUpdateWord('publicationid', 'love', true);
        }).then(function(){
            Word.find({}, function(err, results){
               if(err){
                   done(err);
                   return;
               }

                expect(results.length).to.equal(1);
                done();
            });
        }).fail(done);
    });

    it('Should update the count field if saving an existing word', function(done){
        this.timeout(30000);
        database.connect().then(function() {
            return database.saveOrUpdateWord('publicationid', 'love', true);
        }).then(function(){
            return database.saveOrUpdateWord('publicationid', 'love', true);
        }).then(function(){
            Word.findOne({word:'love'}, function(err, result){
                if(err){
                    done(err);
                    return;
                }
                expect(result.count).to.equal(2);
                done();
            });
        }).fail(function(){

        });
    });

    it('should retrieve the number of articles in the database', function(done){
        this.timeout(30000);
       saveArticle().then(function(){
           return database.articleCount(fakeArticle().publication);
       }).then(function(count){
           try{
               expect(count).to.equal(1);
               done();
           }catch(e){
               done(e);
           }

       })
       .fail(done);
    });

    it.only('Should be able to create keywords and publications documents from the seed data', function(done){
        var keywords = fs.readFileSync('./seed_data/keywords.txt', {encoding:'utf8'}).split('\n');
        var pubsdir = './seed_data/publications/';
        var publicationData = fs.readdirSync(pubsdir).map(function(file){
            return JSON.parse(fs.readFileSync(path.resolve(pubsdir, file), {encoding:'utf8'}));
        });
        this.timeout(30000);
        database.connect().then(database.seed).then(function(){
            try{
                Q.all([
                    Q.nbind(Keyword.count, Keyword)({}),
                    Q.nbind(Publication.find, Publication)({})]
                ).spread(function(keywordCount, publications){
                        expect(keywordCount).to.equal(keywords.length);
                        expect(publications.length).to.equal(publicationData.length);
                        expect(publications[0].id).to.equal(publicationData[0].id);
                        done();
                    });
            }catch(e){
                done(e);
            }

        }, done);
    })
});