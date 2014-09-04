var path = require('path');
var Article = require('../../src/models/article.js');


module.exports = function(){
    return new Article({
        publication : 'pub',
        date : new Date(),
        title : 'title',
        url : 'http://publication.com/'
    });
};
