var database = require('./database.js');
var Article = require('./models/article.js');
var Q = require('q');


function saveArticle(input, dfd){
    var article = new Article(input.article);
    database.hasArticle(article)
        .then(function(result){
            return result ? Q(null) : database.saveArticle(article);
        })
        .done(
            function(){
                saveWords(input, article, dfd)
            },
            function(){
                dfd.reject();
            }
    );
}

function saveWords(input, article, dfd){
    var promises = [];
    input.words.positive.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, true));
    });
    input.words.negative.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, false));
    });
    Q.all(promises).then(
        function(){
            dfd.resolve();
        },
        function(){
            dfd.reject();
        }
    );
}

function save(input){
    input = JSON.parse(input);
    var dfd = Q.defer();
    database.connect().then(
        function(){
            saveArticle(input, dfd);
        },
        function(err){
            dfd.reject(err);
        }
    );
    return dfd.promise;
}

module.exports = save;

