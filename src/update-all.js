var util = require('util');

var Q = require('q');
var _ = require('lodash');

var updatePublication = require('./update-publication.js');
var database = require('./database.js');
var notify = require('./notify.js');

function Queue(slots, publications){
    this.slots = [];
    this.slots.length = slots;
    this.publications = publications.slice(0);
    this.total = publications.length;
    this.finished = false;
    this.pending = [];
    this.stats = {total:0, publications:[]};
}

var EventEmitter = require('events').EventEmitter;
util.inherits(Queue, EventEmitter);

Queue.prototype.tick = function(i){
    var queue = this,
        promise,
        publication;

    if(!queue.publications.length){
        queue.waitForEnd.call(queue);
        return;
    }

    publication = queue.publications.shift();
    console.log('About to update ' + publication);
    promise = updatePublication(publication);
    queue.slots[i] = promise;
    queue.pending.push(promise);
    promise.then(function(stats){
        console.log('update complete.  Stats:');
        console.log(stats);
        stats = JSON.parse(stats);
        stats.publicationId = publication;
        queue.stats.publications.push(stats);
        queue.stats.total += stats.total;
        queue.tick.call(queue, i);
    }, function(err){
        queue.onError.call(queue, err);
    });
};

(function(){
    var _waitForEnd =  _.once(function(queue){
            Q.all(queue.pending).then(function(){
                queue.onComplete.call(queue);
            }, function(err){
                queue.onError.call(queue, err);
            });
        });

    Queue.prototype.waitForEnd = function(){
        _waitForEnd(this);
    };
}());


Queue.prototype.process = function(){
    for(var i= 0, l=this.slots.length; i<l; i++){
        this.tick(i);
    }
};

Queue.prototype.onError = function(err){
    this.emit("error", err);
};

Queue.prototype.onComplete = function(){
    this.emit("complete", this.stats);
};


function updateAll(){
    var dfd = Q.defer();
    console.log("Connecting to database " + process.env['NSE_DBNAME']);
    database.connect().then(function(){
        return database.allPublications();
    }).then(function(publications){

        if(!publications.length){
            dfd.reject(new Error("No publications in database"));
        }

        publications = publications.map(function(pub){
            return pub.id;
        });

        var queue = new Queue(4, publications);
        queue.on('error', function(err){
            dfd.reject(err);
        });

        queue.on('complete', function(stats){
            console.log('Update complete.  Total stats: ');
            console.log(stats);
            var obj = {template:'success', data:stats};
            notify(JSON.stringify(obj)).then(function(){
                dfd.resolve();
            }, function(err){
                // only notification failed, so still treat as success
                dfd.resolve();
            });
        });

        queue.process();
    }).fail(function(err){
       dfd.reject(err);
    });

    return dfd.promise;
}

function fail(err){
    var obj = {template:'failed', data:err};
    notify(JSON.stringify(obj));
}

if(require.main === module){
    updateAll().then(function(){
        console.log("Update complete");
        database.disconnect().then(function(){
            process.exit(0);
        });
    }, function(err){
        console.error("update failed", err);
        database.disconnect().then(function(){
            fail(err);
            process.exit(1);
        });
    });
}else{
    module.exports = updateAll;
}

