var Q = require('q');
var mongoose = require('mongoose');
var Article = require('./models/article.js');
var Word = require('./models/word.js');

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

function hasArticle(article){
    var dfd = Q.defer();
    var query = Article.findOne({'url' : article.url});
    Q.nbind(query.exec, query).then(
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
    var query = Word.findOne({'publicationId' : publicationId, 'word':word});
    Q(query.exec()).then(
        function(result){
            dfd.resolve(result !== null, result);
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
        isPositive : isPositive
    });
    return Q.nbind(word.save, word)();
}

function saveOrUpdateWord(publicationId, wordValue, isPositive){
    var dfd = Q.defer();
    hasWord(publicationId, wordValue)
        .then(function(result, word){
            return result ? updateWord(word) : saveWord(publicationId, wordValue, isPositive)
        })
        .then(function(){
            dfd.resolve();
        }, function(){
           dfd.reject();
        });

    return dfd.promise;
}



module.exports = {
    connect : connect,
    hasArticle : hasArticle,
    hasUrl : hasUrl,
    saveArticle : saveArticle,
    saveOrUpdateWord : saveOrUpdateWord
};

