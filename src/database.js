var Q = require('q');
var mongoose = require('mongoose');
var Article = require('./models/article.js');

function connect(db){
    var dfd = Q.defer();
    mongoose.connect('mongodb://localhost/' + db);
    mongoose.connection.on('error', function(){
        dfd.reject();
    });
    mongoose.connection.once('open', function(){
        dfd.resolve();
    });
    return dfd.promise();
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

function saveArticle(article){
    var dfd = Q.defer();
    article.save(function(err){
        if(err){
            dfd.reject(err);
        }else{
            dfd.resolve();
        }
    });
    return dfd.promise();
};

function saveArticleIfNew(article){
    hasArticle(article).then(
        function(result){
            if(!result){
                saveArticle(article);
            }
        }
    );
};




module.exports = {
    connect : connect,
    hasArticle : hasArticle,
    saveArticle : saveArticle,
    saveArticleIfNew : saveArticleIfNew
};

