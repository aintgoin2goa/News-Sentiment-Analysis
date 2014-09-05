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
    var urls = JSON.parse(input),
        promises = [],
        dfd = Q.defer(),
        filteredUrls = [];

    database.connect().then(function(){
        return Q.all(processUrls(urls, promises));
    })
    .then(function(results){
        results.forEach(function(result, index){
            if(result === true){
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