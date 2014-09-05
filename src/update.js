var Q = require('q');
var path = require('path');

var PhantomWrapper = require('./phantomWrapper.js');
var crawl = path.resolve('phantom/crawl.js');
var extract = path.resolve('phantom/extract/js');
var filter = require('./filter.js');
var save = require('./save.js');
var analyze = require('./analyze.js');

function process(urls, publication){
    urls = JSON.parse(urls);
    var promises = [];
    urls.forEach(function(url){
        promises.push(processUrl(url, publication));
    });

    return Q.all(promises);
}

function processUrl(url, publication){
    var dfd = Q.defer();
    new PhantomWrapper().execute(extract, publication, url)
        .then(analyze)
        .then(save)
        .then(function(){
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });

    return dfd.promise;
}

function update(publication, keyword){
    var dfd = Q.defer();
    new PhantomWrapper().execute(crawl, publication, keyword)
        .then(filter)
        .then(function(urls){
            return process(urls, publication)
        })
        .then(function(){
           dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });

    return dfd.promise;
}

module.exports = update;
