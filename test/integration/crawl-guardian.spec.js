var path = require('path');

describe("Crawl Guardian Site", function(){

    var PhantomWrapper = require('../../src/phantomWrapper.js'),
        wrapper,
        baseUrl = path.resolve('./src/phantom/');

    beforeEach(function(){
        wrapper = new PhantomWrapper();
    });

    it("Should crawl the guardian site and return an array of urls matching a given keyword", function(done){
        var crawlPath = path.join(baseUrl, 'crawl.js');
        wrapper.execute(crawlPath, 'guardian', 'economy');
        wrapper.on('stdout', function(data){
            console.log(data);
            var urls = JSON.parse(data);
            console.log(urls);
            expect(urls).to.be.an.instanceof(Array);
            expect(urls.length).to.be.above(0);
            done();
        });
    });


});