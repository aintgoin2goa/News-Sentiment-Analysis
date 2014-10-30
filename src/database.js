var fs = require('fs');
var path = require('path');

var Q = require('q');
var mongoose = require('mongoose');
var Article = require('./models/article.js');
var Word = require('./models/word.js');
var Keyword = require('./models/keyword.js');
var Publication = require('./models/publication.js');

function connect(){
    var dfd = Q.defer();
    var name = process.env['NSE_DBNAME'] || 'nse_dev';
    mongoose.connect('mongodb://localhost:27017/' + name);
    mongoose.connection.on('error', function(err){
        dfd.reject(err);
    });
    mongoose.connection.on('open', function(){
        dfd.resolve();
    });
    return dfd.promise;
};

function disconnect(){
    return Q.nbind(mongoose.disconnect, mongoose)();
}

function hasArticle(article){
    var dfd = Q.defer();
    var query = Article.findOne({'url' : article.url});
    Q.nbind(query.exec, query)().then(
        function(result){
            dfd.resolve(result !== null);
        },
        function(err){
            dfd.reject(err);
        }
    );
    return dfd.promise;
};

function hasUrl(url){
    return hasArticle({url:url});
}

function saveArticle(article){
    return Q.nbind(article.save, article)();
}

function hasWord(publicationId, word){
    var dfd = Q.defer();
    var query = Word.findOne({'publication' : publicationId, 'word':word});
    query.exec().then(
        function(result){
            debugger;
            dfd.resolve([result != null, result]);
        },
        function(err){
            dfd.reject(err);
        }
    );
    return dfd.promise;
}

function updateWord(word){
    word.count +=1;
    return Q.nbind(word.save, word)();
}

function saveWord(publicationId, wordValue, isPositive){
    var word = new Word({
       publication : publicationId,
        word : wordValue,
        isPositive : isPositive,
        count : 1
    });
    return Q.nbind(word.save, word)();
}

function saveOrUpdateWord(publicationId, wordValue, isPositive){
    var dfd = Q.defer();
    hasWord(publicationId, wordValue)
        .then(function(args){
            var result = args[0], word = args[1];
            return result ? updateWord(word) : saveWord(publicationId, wordValue, isPositive);
        })
        .then(function(){
            dfd.resolve();
        })
        .fail(function(){
           dfd.reject();
        });

    return dfd.promise;
}

function articleCount(publicationId){
    return Q.nbind(Article.count, Article)({publication:publicationId});
}

function seedKeywords(){
    var dfd = Q.defer(),
        readFile = Q.nfbind(fs.readFile),
        keywordsFile = path.resolve('./seed_data/keywords.txt');

    readFile(keywordsFile, {encoding:'utf8'}).then(function(data){
        var keywords = data.split('\n'),
            promises = [];

        keywords.forEach(function(value){
             var keyword = new Keyword({keyword:value});
             promises.push(Q.nbind(keyword.save, keyword)());
        });

        return Q.all(promises);
    })
    .then(function(){
       dfd.resolve();
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd.promise;
}

function seedPublications(){
    var dfd = Q.defer(),
        readdir = Q.nfbind(fs.readdir),
        directory = './seed_data/publications/';

    readdir(directory)
        .then(function(files){
            var promises = [];
            files.forEach(function(file){
                var data = require(path.resolve(directory, file)),
                    publication = new Publication(data);

                promises.push(Q.nbind(publication.save, publication)());
            });

            return Q.all(promises);
        })
        .then(function(){
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });

    return dfd.promise;
}

function seed(){
    var dfd = Q.defer();
    seedKeywords().then(seedPublications).then(function(){
        dfd.resolve();
    }).fail(function(err){
        dfd.reject(err);
    });

    return dfd.promise;
}

function allKeywords(){
    return Q.nbind(Keyword.find, Keyword)({});
}

function allPublications(){
    return Q.nbind(Publication.find, Publication)({});
}

function updatePublication(publicationId, articleCount, totalScore){
   var dfd = Q.defer();
    Publication.findOne({id: publicationId}, function(err, publication){
        if(err){
            dfd.reject(err);
            return;
        }

        publication.totalScore = publication.totalScore + totalScore;
        publication.articleCount = publication.articleCount + articleCount;
        publication.averageScore = publication.totalScore / publication.articleCount;
        publication.save(function(err){
            if(err){
                dfd.reject(err);
                return;
            }

            dfd.resolve();
        })
    });

    return dfd.promise;
}


module.exports = {
    connect : connect,
    disconnect : disconnect,
    hasArticle : hasArticle,
    hasUrl : hasUrl,
    saveArticle : saveArticle,
    saveOrUpdateWord : saveOrUpdateWord,
    articleCount : articleCount,
    seed : seed,
    allKeywords : allKeywords,
    allPublications : allPublications,
    updatePublication : updatePublication
};

