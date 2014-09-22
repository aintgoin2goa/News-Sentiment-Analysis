
exports.crawl = {
    url : 'http://content.guardianapis.com/search?q={keyword}&from-date={date}&order-by=relevance&api-key=ggrgqstehjn5rheez97ue42a',
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
            result : 'success',
            title : '',
            date : null,
            content : ''
        };
        var error = function(txt){
            return {
                result : 'error',
                message : txt
            }
        };
        var titleEl = document.querySelector('h1');
        var dateEl = document.querySelector('time[itemprop="datePublished"]');
        var contentEl =  document.querySelector('#article-body-blocks');
        if(!titleEl){
            return error('could not find title');
        }

        if(!dateEl || !dateEl.getAttribute('datetime')){
            return error('could not find date');
        }

        if(!contentEl || !contentEl.textContent){
            return error('could not find content');
        }

        extracted.title = titleEl.textContent;
        extracted.date = dateEl.getAttribute('datetime');
        extracted.content = contentEl.textContent;

        return extracted;
    }
};
