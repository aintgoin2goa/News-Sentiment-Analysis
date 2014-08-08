try{
    var system = require('system');
    var args = system.args.slice(1);
    if(args.length < 2){
        system.stderr.write("Not enough args!");
        phantom.exit(1);
    }
    var adaptorName = args[0];
    var keyword = args[1];
    var date = new Date();
    var yyyymmdd = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var adaptor = require('./adaptors/' + adaptorName + '.js');
    var page = require('webpage').create();
    var url = adaptor.crawl.url.replace('{keyword}', keyword).replace('{date}', yyyymmdd);

    page.open(url, function(status){
         if(status === 'fail'){
             system.stderr.write("Failed to open url " + url);
             phantom.exit(1);
         }

         page.render('test.jpg');
         setTimeout(function(){
             var urls = adaptor.crawl.execute();

             if(urls === false){
                 system.stderr.write("Failed to crawl page " + url);
             }

             if(!urls.length){
                 system.stderr.write("No urls found" + "\n");
             }

             system.stdout.write(JSON.stringify(urls));
             phantom.exit(0);
         }, 1000);

     });

}catch(e){
    phantom.exit(1);
}
