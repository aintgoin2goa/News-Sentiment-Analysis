try{
    var system = require('system');
    var args = system.args.slice(1);
    if(args.length < 2){
        system.stderr.write("Not enough args!");
        phantom.exit(1);
    }
    var adaptorName = args[0];
    var url = args[1];
    var adaptor = require('./adaptors/' + adaptorName + '.js');
    var page = require('webpage').create();

    page.onError= function(msg){
        return false;
    };

    page.open(url, function(status){
        if(status === 'fail'){
            system.stderr.write("Failed to open url " + url);
            phantom.exit(1);
        }
        page.render('test.jpg');
        setTimeout(function(){
            page.render('test2.jpg');
            var content = page.evaluate(adaptor.extract.execute);

            if(content.result === 'error'){
                system.stderr.write(content.message);
                phantom.exit(1);
            }

            delete content.result;

            system.stdout.write(JSON.stringify(content));
            phantom.exit(0);
        }, 1000);

    });

}catch(e){
    phantom.exit(1);
}
