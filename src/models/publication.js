var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var publicationSchema = new Schema({
    id : {type:String, index:{unique:true, dropDupes:true}},
    name : String,
    homepage : String,
    totalScore : Number,
    articleCount: Number,
    averageScore: Number
});

module.exports = mongoose.model('Publication', publicationSchema);
