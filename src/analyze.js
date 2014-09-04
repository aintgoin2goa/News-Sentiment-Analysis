var sentimental = require('Sentimental');



function analyze(input){
    var article = JSON.parse(input);
    var result = sentimental.analyze(article.content);
    var words = {
        positive : result.positive.words.slice(0),
        negative : result.negative.words.slice(0)
    };
    delete article.content;
    delete result.positive.words;
    delete result.negative.words;

    article.analysis = {
        score : result.score,
        comparative : result.comparative,
        positive : result.positive,
        negative : result.negative
    };

    return JSON.stringify({
        article: article,
        words: words
    });
}

module.exports = analyze;