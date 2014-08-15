var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var wordSchema = new Schema({
    publication : String,
    word : String,
    isPositive : Boolean,
    count : {type:Number, default:0}
});

return mongoose.model('Word', wordSchema);