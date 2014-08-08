
exports.crawl = {
    url : 'http://content.guardianapis.com/search?q={keyword}&from-date={date}&order-by=relevance',
    execute : function(){
        var content = page.plainText;
        var json = JSON.parse(content);
        var urls = [];
        json.response.results.forEach(function(result){
            urls.push(result.webUrl);
        });
        return urls;
    }
};
