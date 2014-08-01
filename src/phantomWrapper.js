var spawn = require("child_process").spawn;
var path = require('path');
var EventEmitter = require("events").EventEmitter;

var Wrapper = function(args){
    this.cli = args && args.cli ? args.cli : false;
    this.instance = null;
};

Wrapper.prototype = Object.create(new EventEmitter());

function init() {
    var args = process.argv.slice(2);
    var wrapper = new Wrapper({cli:true});
    wrapper.execute.apply(wrapper, args);
};

Wrapper.prototype.execute = function(){
    var phantomPath = path.resolve(__dirname, '../bin/phantomjs');
    var args = Array.prototype.slice.call(arguments, 0);
    this.instance = spawn(phantomPath, args);
    this.instance.stdout.on('data', this.onResponse.bind(this));
    this.instance.stderr.on('data', this.onError.bind(this));
};

Wrapper.prototype.onResponse = function(data){
    data = data.toString();
    debugger;
    if(this.cli){
        process.stdout.write(data);
    }else{
        this.emit("stdout", data);
    }
};

Wrapper.prototype.onError = function(err){
    err = err.toString();
    if(this.cli){
        process.stderr.write(err);
    }else{
        this.emit("stderr");
    }
}

if(require.main === module){
    cliMode = true;
    init();
}else{
    module.exports = Wrapper;
}





