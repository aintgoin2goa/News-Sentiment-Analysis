var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

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

articleSchema.statics.findByPublication = function findByPublication(publication){
    return find({'publication':publication}).sort('-date').exec();
};

module.exports =  mongoose.model('Article', articleSchema);