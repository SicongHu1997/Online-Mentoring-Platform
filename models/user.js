var mongoose = require ("../routes/db");
Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
    username : String,
    userpsw : String,
    firstname:String,
    lastname:String,
    gender:{type:Number,default:1},
    age:{type: Number, default: 1},
    logindate : Date
});
module.exports=mongoose.model('User',UserSchema);