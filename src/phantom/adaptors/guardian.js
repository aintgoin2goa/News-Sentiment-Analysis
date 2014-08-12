
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

exports.extract = {
    execute : function(){
        var extracted = {
            title : '',
            date : null,
            content : ''
        };
        var error = function(txt){
            return {
                result : 'error',
                message : text
            }
        };
        var titleEl = document.querySelector('h1.content__headline');
        var dateEl = document.querySelector('content__dateline time');
        var contentEl =  document.querySelector('.js-article__body');
        if(!titleEl){
            return error('could not find title');
        }

        if(!dateEl || dateEl.dataset.timestamp){
            return error('could not find date');
        }

        if(!contentEl || !contentEl.textContent){
            return error('could not find content');
        }

        extracted.title = titleEl.textContent;
        extracted.date = dateEl.dataset.timestamp;
        extracted.content = contentEl.textContent;

        return extracted;
    }
};
