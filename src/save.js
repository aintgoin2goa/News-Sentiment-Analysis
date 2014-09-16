var database = require('./database.js');
var Article = require('./models/article.js');
var Q = require('q');


function saveArticle(input){
    var article = new Article(input.article);
    var dfd = Q.defer();
    database.hasArticle(article)
        .then(function(result){
            return result ? Q(null) : database.saveArticle(article);
        })
        .then(function(){
            dfd.resolve(article);
        })
        .fail(function(err){
            dfd.reject(err);
        });

    return dfd.promise;
}

function saveWords(input, article){
    var dfd = Q.defer();
    var promises = [];
    input.words.positive.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, true));
    });
    input.words.negative.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, false));
    });
    Q.all(promises).then(
        function(){
            dfd.resolve(article);
        },
        function(){
            dfd.reject();
        }
    );

    return dfd.promise;
}

function updatePublication(article){
    return database.updatePublication(article.publication, 1, article.analysis.score);
}


function save(input){
    input = JSON.parse(input);
    var dfd = Q.defer();
    database.connect().then(function(){
        return saveArticle(input)
    }).then(function(article) {
        return saveWords(input, article);
    }).then(function(article){
        return updatePublication(article);
    }).then(function(){
        dfd.resolve();
    }).fail(function(err){
        dfd.reject(err);
    });

    return dfd.promise;
}

module.exports = save;

