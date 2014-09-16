var Q = require('q');
var config = require('./config.js');
var update = require('./update.js');
var database = require('./database.js');

function Queue(slots, keywords, publication){
    this.slots = [];
    this.slots.lenght = slots;
    this.keywords = [];
    this.publication = publication;
    this.pending = [];
    this.count = 0;
}

var EventEmitter = require('events').EventEmitter;
util.inherits(Queue, EventEmitter);

Queue.prototype.tick = function(i){
    var queue = this,
        promise,
        keyword;

    if(!queue.keywords.length){
        Q.all(queue.pending).then(function(){
            queue.onComplete.call(queue);
        }, function(err){
            queue.onError.call(queue, err);
        });
        return;
    }

    keyword = keywords.shift();
    promise = update(queue.publication, keyword);
    queue.slots[i] = promise;
    queue.pending.push(promise);
    promise.then(function(count){
        queue.count += count;
        queue.tick.call(queue, i);
    }, function(err){
       queue.onError.call(queue, err);
    });
};

Queue.prototype.process = function(){
    for(var i= 0, l=this.slots.length; i<l; i++){
        this.tick(i);
    }
};

Queue.prototype.onError = function(err){
    this.emit("error", err);
};

Queue.prototype.onComplete = function(){
    this.emit("complete", this.count);
};

function getKeywords(){
   return database.allKeywords();
}

function updatePublication(publication){
    var dfd = Q.defer();
    getKeywords().then(function(keywords){
        var queue = new Queue(4, keywords, publication);
        queue.on('error', function(){
            dfd.reject(err);
        });
        queue.on('complete', function(count){
           dfd.resolve(count);
        });
    });

    return dfd.promise;
}

module.exports = updatePublication;