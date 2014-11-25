var Q = require('q');

var database = require('./database.js');

function processUrl(url){
    return database.hasUrl(url);
}

function processUrls(urls, promises){
    urls.forEach(function(url){
       promises.push(processUrl(url));
    });

    return promises;
}

function filter(input){
    console.log('filter ' + input);
    var urls = JSON.parse(input),
        promises = [],
        dfd = Q.defer(),
        filteredUrls = [];

    database.connect().then(function(){
        return Q.all(processUrls(urls, promises));
    })
    .then(function(results){
            console.log('results', results);
        results.forEach(function(result, index){
            if(result === false){
                filteredUrls.push(urls[index]);
            }
        });

        dfd.resolve(JSON.stringify(filteredUrls));
    })
    .fail(function(err){
       dfd.reject(err);
    });

    return dfd.promise;
}

module.exports = filter;
