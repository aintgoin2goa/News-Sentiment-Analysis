var Q = require('q');
var config = require('./config.js');
var update = require('./update.js');
var database = require('./database.js');

function loadKeywords(){
    return config.loadKeywords();
}

function updatePublication(publication){
    var dfd = Q.defer();
    var promises = [];
    loadKeywords().then(function(keywords){
        keywords.forEach(function(keyword){
            promises.push(update(publication, keyword));
        });
        return Q.all(promises);
    })
    .then(function(results){
        var count = results.reduce(function(total, current){
            return total + current;
        }, 0);
        return [count, database.articleCount(publication)];
    })
    .spread(function(added, total){
        dfd.resolve({
            publication : publication,
            added : added,
            total : total
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });


    return dfd.promise;
}

module.exports = updatePublication;

