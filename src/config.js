var Q = require('q');
var fs = require('fs');

var KEYWORDS_FILE = './config/keywords.txt';

exports.loadKeywords = function(){
    var dfd = Q.defer();
    fs.readFile(KEYWORDS_FILE, {encoding:'utf8'}, function(err, content){
        if(err){
            dfd.reject(err);
            return;
        }

        dfd.resolve(content.split('\n'));
    });

    return dfd.promise;
};

exports.loadPublications = function(){

}
