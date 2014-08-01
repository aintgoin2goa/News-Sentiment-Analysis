
exports.crawl = {
    url : 'https://www.google.co.uk/search?q={keyword}+site:www.theguardian.com&tbm=nws',
    execute : function(){
        var urls = [],
            links = document.querySelectorAll('a.l'),
            i,l;

        for(i=0,l=links.length; i<l; i++){
            if(links[i].href){
                urls.push(links[i].href);
            }
        }

        return urls;
    }
};
