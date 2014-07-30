var EventEmitter = require('events').EventEmitter;

function FakeChildProcess(){
    var process = this;
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.stdout.write = function(data){
        process.stdout.emit("data", data);
    };
    this.stderr.write = function(data){
        process.stderr.emit("data", data);
    };
}

module.exports = FakeChildProcess;