var database = require('./database.js');
var Article = require('./models/article.js');
var input = JSON.parse(process.argv[2]);
var article;

function saveArtice(){
    article = new Article(input.article);
    database.hasArticle(article)
        .then(function(result){
            return result ? Q(null) : database.saveArticle(article);
        })
        .done(saveWords, fail);
}

function saveWords(){
    var promises = [];
    input.words.positive.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, true));
    });
    input.words.negative.forEach(function(w){
        promises.push(database.saveOrUpdateWord(article.publication, w, false));
    });
    Q.all(promises).then(complete, fail);
}

function fail(e){
    system.stderr.write(e.toString());
    process.exit(1);
}

function complete(){
   process.exit(0);
}

database.connect().then(saveArticle, fail);

