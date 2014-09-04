var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
    publication : String,
    url : String,
    title : String,
    date : Date,
    analysis : {
        score : Number,
        comparative : Number,
        positive : {
            score : Number,
            comparative : Number
        },
        negative : {
            score : Number,
            comparative : Number
        }
    }
});

module.exports =  mongoose.model('Article', articleSchema);