var database = require('./database');

database.connect().then(function(){
    return database.seed();
}).then(function(){
    console.log('seed complete');
    process.exit(0);
}).fail(function(e){
   console.error(e);
    process.exit(-1);
});
