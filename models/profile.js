var mongoose = require ("../routes/db");
    Schema = mongoose.Schema;

var profileSchema = new mongoose.Schema({
    userid: String,
    name: String,
    lat: Number,
    lng: Number,
    address: String,
    contact: String,
    skilllearn: String,
    skillteach: String,
    intro: String
});

module.exports=mongoose.model('profile', profileSchema);