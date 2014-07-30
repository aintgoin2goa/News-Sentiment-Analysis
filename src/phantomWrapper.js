var spawn = require("child_process").spawn;
var path = require('path');

var phantom;

function init(){
    var args = process.argv.slice(2);
    execute.apply(this, args);
}

function execute(){
    var phantomPath = path.join(__dirname + '../bin/phantomjs');
    var args = Array.prototype.slice.call(arguments, 0);
    phantom = spawn(phantomPath, args);
    phantom.stdout.on('data', onResponse);
    phantom.stderr.on('data', onError);
}

function onResponse(data){
    process.stdout.write(data);
}

function onError(err){
    if(typeof err !== 'string'){
        err = JSON.stringify(err);
    }

    process.stderr.write(err);
}

if(require.main === module){
    init();
}else{
    module.exports = {
        execute : execute
    }
}





