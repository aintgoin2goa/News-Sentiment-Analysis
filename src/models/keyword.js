var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keywordSchema = new Schema({
    keyword : {type:String, index:{unique:true, dropDupes:true}}
});

module.exports = mongoose.model('Keyword', keywordSchema);
