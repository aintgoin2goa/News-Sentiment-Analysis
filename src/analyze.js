var sentimental = require('Sentimental');
var article = JSON.parse(process.argv[2]);
var result = sentimental.analyze(article.content);
var words = {
    positive : result.positive.words.slice(0),
    negative : result.negative.words.slice(0)
}
delete article.content;
delete result.positive.words;
delete result.negative.words;

article.analysis = {
    score : result.score,
    comparative : result.comparative,
    positive : result.positive,
    negative : result.negative
}

var output = {
    article : article,
    words : words
}

process.stdout.write(JSON.stringify(output));

process.exit();

