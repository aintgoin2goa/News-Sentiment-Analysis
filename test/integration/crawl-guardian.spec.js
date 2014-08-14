var path = require('path');
var expect = require('chai').expect;

describe("Guardian Adaptor", function(){

    var PhantomWrapper = require('../../src/phantomWrapper.js'),
        wrapper,
        baseUrl = path.resolve('./src/phantom/');

    beforeEach(function(){
        wrapper = new PhantomWrapper();
    });

    it("Should crawl the guardian site and return an array of urls matching a given keyword", function(done){
        this.timeout(5000);
        var crawlPath = path.join(baseUrl, 'crawl.js');
        wrapper.execute(crawlPath, 'guardian', 'israel');
        wrapper.on('stdout', function(data){
            //console.log(data);
            var urls = JSON.parse(data);
            console.log(urls);
            expect(urls).to.be.an.instanceof(Array);
            expect(urls.length).to.be.above(0);
            done();
        });
    });

    it.only("Should be able to visit a news page on the guardian and extact the title, date and content", function(done){
        this.timeout(60000);
        var url = 'http://www.theguardian.com/uk-news/2014/aug/12/uk-iraq-kurds-yazidis-isis';
        var extract = path.join(baseUrl, 'extract.js');
        wrapper.execute(extract, 'guardian', url);
        wrapper.on('stdout', function(data){
            var response = JSON.parse(data);
            expect(response.title).to.equal('UK steps up role in Iraq with move to aid Kurds and Yazidis against Isis');
            expect(response.date).to.equal('2014-08-12T22:23BST');
            expect(response.content).to.contain('The Cobra meeting, chaired by the foreign secretary Philip Hammond');
            done();
        });
        wrapper.on('stderr', function(err){
            done(new Error(err));
        })
    });


});