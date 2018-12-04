var mongoose = require ("../routes/db");
Schema = mongoose.Schema;
var ChatSchema = new mongoose.Schema({
    from : String,
    fromname : String,
    to : String,
    toname : String,
    content:String,
    date : Date
});
module.exports=mongoose.model('Chat',ChatSchema);