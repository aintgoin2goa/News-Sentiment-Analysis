var spawn = require("child_process").spawn;
var path = require('path');
var EventEmitter = require("events").EventEmitter;
var Q = require('q');

var Wrapper = function(args){
    this.cli = args && args.cli ? args.cli : false;
    this.instance = null;
    this.data = '';
    this.deferred;
};

Wrapper.prototype = Object.create(new EventEmitter());

function init() {
    var args = process.argv.slice(2);
    var wrapper = new Wrapper({cli:true});
    wrapper.execute.apply(wrapper, args);
};

Wrapper.prototype.execute = function(){
    this.deferred = Q.defer();
    var phantomPath = path.resolve(__dirname, '../node_modules/.bin/phantomjs');
    var args = Array.prototype.slice.call(arguments, 0);
    this.instance = spawn(phantomPath, args);
    this.instance.stdout.on('data', this.onResponse.bind(this));
    this.instance.stderr.on('data', this.onError.bind(this));
    this.instance.on('exit', this.onExit.bind(this));
    return this.deferred.promise;
};

Wrapper.prototype.onResponse = function(data){
    data = data.toString();
    if(this.cli){
        process.stdout.write(data);
    }else{
        this.emit("stdout", data);
    }
    this.data += data;
    this.deferred.notify(data);
};

Wrapper.prototype.onError = function(err){
    err = err.toString();
    if(this.cli){
        process.stderr.write(err);
    }else{
        this.emit("stderr", err);
    }
    this.deferred.reject(err);
};

Wrapper.prototype.onExit = function(){
    this.deferred.resolve(this.data);
};

if(require.main === module){
    cliMode = true;
    init();
}else{
    module.exports = Wrapper;
}





