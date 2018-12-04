var mongoose = require ("../routes/db");
Schema = mongoose.Schema;
var RateSchema = new mongoose.Schema({
    userid : String,
    totalrate: Number,
    ratenumber: Number
});
module.exports=mongoose.model('Rate',RateSchema);