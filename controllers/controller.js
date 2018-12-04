var express = require('express');
var googlemaps = require ("googlemaps");
var crypto = require("crypto");
var session = require('express-session');
var ObjectID = require('mongodb').ObjectID;
var nodemailer  = require('nodemailer');

var profile =require('../models/profile');
var user = require('../models/user');
var rate = require('../models/rate');
var chat = require('../models/chat')

var publicConfig = {
    key: 'AIzaSyAAzQK6iKoIxNpK5gUl_bnJGoHkkxcHVHc',
    stagger_time:       1000,
    encode_polylines:   false,
    secure:             true
};
var gmAPI = new googlemaps(publicConfig);

var transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // use SSL
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: '302697104@qq.com',
        pass: 'tmjinahhvsrubhbj'
    }
});


var router = express.Router();
router.use(session({
    secret :  'secret',
    resave : true,
    saveUninitialized: false,
    cookie : {
        maxAge : 1000 * 60 * 60,
    },
}));

var showProfile;

module.exports.recentMessage=function(req, res) {
    var userid;
    if(req.session.userid) {
        userid = req.session.userid;
        res.render('recentchat', {user: userid});
    }
    else{
        res.render("index");
    }
};

module.exports.password=function(req, res) {
    if (req.session.userid) {
        res.render("password");
    }
    else {
        res.render("index");
    }
};
module.exports.logout=function(req, res) {
    if (req.session.userid) {
        req.session.userid = null;
        res.render("index");
    }
    else {
        res.render("index");
    }
};
module.exports.resultgrid=function(req, res) {
        if(req.session.userid){
            if(showProfile){
                res.render("resultgrid",{
                    profiles: showProfile
                });
            }
            else{
                alert("please search your requirment!");
                res.redirect('/search');
            }
        }
        else{
            res.render("index");
        }
};
module.exports.chatKeys=function(req, res) {
    var id = req.params.key;
    var userid;
    var name;
    if(req.session.userid) {
        userid = req.session.userid;
        user.find({_id: new ObjectID(id)}, function(err, obj) {
            if (obj.length == 1) {
                name = obj[0].firstname+" "+obj[0].lastname;
            }
            res.render('chat', {id: id, user: userid, name: name});
        });
    }
    else{
        res.render("index");
    }
};

module.exports.profileKeys=function(req, res) {
    var id = req.params.key;
    var name="";
    var gender="";
    var age="";
    var email="";
    var address="";
    var contact="";
    var skilllearn="";
    var skillteach="";
    var intro="";
    var rating=0;
    var ratnum=0;
    if(req.session.userid){
        profile.find({userid: id}, function(err, obj) {
            if (obj.length == 1) {
                address = obj[0].address;
                contact = obj[0].contact;
                skilllearn = obj[0].skilllearn;
                skillteach = obj[0].skillteach;
                intro = obj[0].intro;
                rate.find({userid: id}, function(err, obj) {
                    if (obj.length == 1) {
                        ratnum = obj[0].ratenumber;
                        if(ratnum==0){
                            rating = 3;
                        }
                        else{
                            rating = obj[0].totalrate/obj[0].ratenumber;
                            rating = Math.round( rating * 10) / 10;
                        }
                        user.find({_id: new ObjectID(id)}, function(err, obj) {
                            if (obj.length == 1) {
                                email = obj[0].username;
                                name = obj[0].firstname+" "+obj[0].lastname;
                                age = obj[0].age;
                                if(obj[0].gender==1){
                                    gender = "male";
                                }
                                else{
                                    gender = "female";
                                }
                                res.render('profile', {
                                    id: id,
                                    name: name,
                                    gender: gender,
                                    age: age,
                                    email: email,
                                    address: address,
                                    contact: contact,
                                    skilllearn: skilllearn,
                                    skillteach: skillteach,
                                    intro: intro,
                                    rating: rating,
                                    ratnum: ratnum
                                });
                            }
                            else{
                                res.redirect('/search');
                            }
                        });
                    }
                    else{
                        res.redirect('/search');
                    }
                });
            }
            else{
                res.redirect('/search');
            }
        });
    }
    else{
        res.render('index');
    }
}
module.exports.register=function (req, res) {
    res.setHeader('Content-type','application/json;charset=utf-8')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    var Userfirstname=req.body.firstname;
    var Userlastname=req.body.lastname;
    var gender=req.body.gender;
    var age=req.body.age;
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    var updatestr = {username: UserName};
    if(UserName == ''){
        res.send({status:'success',message:false}) ;
    }
    res.setHeader('Content-type','application/json;charset=utf-8')
    user.find(updatestr, function(err, obj){
        if (err) {
            console.log("Error:" + err);
        }
        else {
            if(obj.length == 0){
                user.create({'username' : UserName,
                    'userpsw' : newPas,
                    'firstname':Userfirstname,
                    'lastname':Userlastname,
                    'gender':gender,
                    'age':age,
                    'logindate' : new Date()},function(err, small){
                    if (err) return handleError(err);
                })
                res.send({status:'success',message:true})
            }else if(obj.length !=0){
                res.send({status:'success',message:false})
            }else{
                res.send({status:'success',message:false})
            }
        }
    })
};
module.exports.index=function (req, res, next) {
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    var updatestr = {username: UserName,userpsw:newPas};
    res.setHeader('Content-type','application/json;charset=utf-8')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    user.find(updatestr, function(err, obj){
        if (err) {
            console.log("Error:" + err);
        }
        else {
            if(obj.length == 1){
                req.session.userid = obj[0]._id;
                console.log('login success');
                res.send({status:'success',message:true,data:obj});
            }else{
                console.log('please register your account');
                res.send({status:'success',message:false});
            }
        }
    })
}

module.exports.process=function(req, res){
    console.log(req.body.id);
    console.log(req.body.rating);
    rate.findOneAndUpdate({userid: req.body.id},{$inc:{"ratenumber":1,"totalrate":req.body.rating}},function (err, small) {
        if (err) return handleError(err);
    });
    var return_string = '/profile/'.concat(req.body.id)
    res.redirect(303, return_string);
};

module.exports.message=function(req, res){
    console.log(req.body.from);
    console.log(req.body.to);
    console.log(req.body.content);
    user.find({_id: new ObjectID(req.body.from)}, function (err, obj) {
        var name = '';
        if(obj.length == 1){
            name = obj[0].firstname+" "+obj[0].lastname;
            user.find({_id: new ObjectID(req.body.to)}, function (err, obj) {
                var toname = '';
                if(obj.length == 1){
                    toname = obj[0].firstname+" "+obj[0].lastname;
                    var date = new Date();
                    date.setTime(date.getTime()+10*60*60*1000);
                    chat.create({
                        'from': req.body.from,
                        'fromname': name,
                        'to': req.body.to,
                        'toname':toname,
                        'content': req.body.content,
                        'date': date
                    }, function (err, small) {
                        if (err) return handleError(err);
                    });
                }
            });
        }
    });
    var return_string = '/chat/'.concat(req.body.to);
    res.redirect(303, return_string);
}

module.exports.process_search=function(req, res){
    console.log(req.body.lat);
    // var geocodeParams = {
    //     "address":    req.body.location
    // };
    if ((!!req.body.lat)&&(!!req.body.range)&&(!!req.body.skill)&&(!!req.body.role)) {
        // gmAPI.geocode(geocodeParams, function (err, result) {

        //     var lat = result.results[0].geometry.location.lat;
        //     var lng = result.results[0].geometry.location.lng;


        var lat = parseFloat(req.body.lat);
        var lng = parseFloat(req.body.lng);
        var switch_i;
        if(req.body.role==1){
            profile.find({"skilllearn":{ "$regex":req.body.skill, "$options": "ix" }}, function (err, obj) {
                var ret=[{"lat":lat,"lng":lng}];
                var show=[];
                console.log("1");
                console.log(obj);
                if(obj.length>0){
                    for(i=0;i<obj.length;i++){
                        if(distance(lat,lng,obj[i].lat,obj[i].lng)<Number(req.body.range)){
                            ret.push({"userid":obj[i].userid,"lat":obj[i].lat,"lng":obj[i].lng,"name":obj[i].name,"address":obj[i].address});
                            show.push(obj[i]);
                        }
                    }
                }
                console.log(ret);
                res.send(ret);
                showProfile = show;
            });
        }
        else{
            profile.find({"skillteach":{ "$regex":req.body.skill, "$options": "ix" }}, function (err, obj) {
                var ret=[{"lat":lat,"lng":lng}];
                var show=[];
                console.log("2");
                console.log(obj);
                if(obj.length>0){
                    for(i=0;i<obj.length;i++){
                        console.log(distance(lat,lng,obj[i].lat,obj[i].lng));
                        if(distance(lat,lng,obj[i].lat,obj[i].lng)<Number(req.body.range)){
                            ret.push({"userid":obj[i].userid,"lat":obj[i].lat,"lng":obj[i].lng,"name":obj[i].name,"address":obj[i].address});
                            show.push(obj[i]);
                        }
                    }
                }
                console.log(ret);
                res.send(ret);
                showProfile = show;
            });
        }
        // });
    }
    else {
        console.log("3");
        console.log(obj);
        res.send([]);
    }
};
module.exports.edit=function(req, res){
    console.log(req.file);
    console.log(req.body.myid);
    console.log(req.body.address);
    console.log(req.body.contact);
    console.log(req.body.learn);
    console.log(req.body.teach);
    console.log(req.body.intro);
    var geocodeParams = {
        "address":    req.body.address
    };
    rate.find({userid: req.body.myid}, function(err, obj) {
        if(obj.length == 0) {
            rate.create({
                'userid': req.body.myid,
                'totalrate': 0,
                'ratenumber': 0
            }, function (err, small) {
                if (err) return handleError(err);
            });
        }
    });
    if ((!!req.body.address)&&(!!req.body.contact)&&(!!req.body.learn)&&(!!req.body.teach)&&(!!req.body.intro)) {
        gmAPI.geocode(geocodeParams, function (err, result) {
            user.find({_id: new ObjectID(req.body.myid)}, function (err, obj) {
                var name = "";
                if (obj.length == 1) {
                    name = obj[0].firstname+" "+obj[0].lastname;
                }
                var lat = result.results[0].geometry.location.lat;
                var lng = result.results[0].geometry.location.lng;
                var query = {'userid': req.body.myid},
                    options = {upsert: true, new: true, setDefaultsOnInsert: true};
                profile.findOneAndUpdate(query, {
                    'userid': req.body.myid,
                    'name': name,
                    'lat': lat,
                    'lng': lng,
                    'address': req.body.address,
                    'contact': req.body.contact,
                    'skilllearn': req.body.learn,
                    'skillteach': req.body.teach,
                    'intro': req.body.intro
                }, options, function (err, small) {
                    if (err) return handleError(err);
                });
            });
        });
    }
    var return_string = '/search';
    res.redirect(303, return_string);
}
module.exports.recchat=function(req, res){
    chat.find({
            $or: [{'to': req.body.myid},{'from':req.body.myid}]}
        ,null,{
            skip:0,
            limit:100,
            sort:{
                date: 1
            }
        }, function (err, obj) {
            var result=[];
            var idlist=[];
            var content;
            var time;
            var id;
            for(i=0;i<obj.length;i++){
                if(obj[i].to.localeCompare(req.body.myid)==0)
                {
                    content = obj[i].fromname;
                    time = obj[i].date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    id = obj[i].from;
                    if(!(include(idlist,id))){
                        result.push({"id":id,"content":content,"time":time});
                        idlist.push(id);
                    }
                }
                else
                {
                    content = obj[i].toname;
                    time = obj[i].date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    id = obj[i].to;
                    if(!(include(idlist,id))){
                        result.push({"id":id,"content":content,"time":time});
                        idlist.push(id);
                    }
                }
            }
            res.send(result);
        });
};

module.exports.refreshchat=function(req, res){
    console.log(req.body.from);
    console.log(req.body.to);
    chat.find({
        $or: [
            { $and: [{'from': req.body.from}, {'to': req.body.to}] },
            { $and: [{'to': req.body.from}, {'from': req.body.to}] }
        ]
    },null,{
        skip:0,
        limit:100,
        sort:{
            date: 1
        }
    }, function (err, obj) {
        var result=[];
        var msg_type;
        var content;
        var time;
        var id;
        for(i=0;i<obj.length;i++){
            content = obj[i].content;
            time = obj[i].date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
            if(obj[i].from==req.body.to){
                msg_type="message";
            }
            else{
                msg_type="message_send";
            }
            result.push({"type":msg_type,"content":content,"time":time});
        }
        res.send(result);
    });
}
module.exports.passwordPOST=function (req,res) {
    res.setHeader('Content-type','application/json;charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    var UserPsw = req.body.password;
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    var id = req.session.userid;
    user.update( {_id:new ObjectID(id)}, {userpsw:newPas}, function(err, obj){
        if (err) {
            console.log("Error:" + err);
        }
        else {
            console.log('successful change!');
            res.send({status:'success',message:true})
        }
    })
};
module.exports.search= function(req, res) {
    if(req.session.userid){
        user.find({_id: new ObjectID(req.session.userid)}, function(err, obj) {
            var name = obj[0].firstname+" "+obj[0].lastname;
            profile.find({userid: req.session.userid}, function(err, obj) {
                if (obj.length == 1) {
                    var address = obj[0].address;
                    res.render("search",{name: name, address: address});
                }
                else{
                    var address = "";
                    res.render("search",{
                        name: name,
                        address: address
                    });
                }
            });
        });
    }
    else{
        res.render("index");
    }
}

module.exports.editProfile=function(req, res) {
    if(req.session.userid) {
        var myid = req.session.userid;
        profile.find({userid: req.session.userid}, function(err, obj) {
            var address="";
            var contact="";
            var learn="";
            var teach="";
            var intro="";
            if (obj.length == 1) {
                address = obj[0].address;
                contact = obj[0].contact;
                learn = obj[0].skilllearn;
                teach = obj[0].skillteach;
                intro = obj[0].intro;
                res.render("editprofile", {
                    myid: myid,
                    address: address,
                    contact: contact,
                    learn: learn,
                    teach: teach,
                    intro: intro
                });
            }
            else {
                res.render("editprofile", {
                    myid: myid,
                    address: address,
                    contact: contact,
                    learn: learn,
                    teach: teach,
                    intro: intro
                });
            }
        });
    }
    else{
        res.render("index")
    }
}
module.exports.forget_pwd=function (req,res) {
    res.setHeader('Content-type','application/json;charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    var UserName = req.body.username;
    var updatestr = {username: UserName};
    user.find(updatestr, function(err, obj) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            if (obj.length == 1) {
                console.log('success');
                var newpwd=createPassword(6,10);
                var md5 = crypto.createHash("md5");
                var newPas = md5.update(newpwd).digest("hex");
                user.update( {username: UserName}, {userpsw:newPas}, function(err, docs){
                    if(err) console.log(err);
                    console.log('successful change!');
                })
                user.find(updatestr, function(err, obj) {
                    var mailOptions = {
                        from: '302697104@qq.com', // 发件人
                        to: `${UserName}`, // 收件人
                        subject: 'Hello ✔', // 主题
                        text: 'This is from The Storm', // plain text body
                        html: `<b>your username is ${UserName} </b><br><b>your password is ${newpwd}</b>`+
                        `<br><b>Please remember change your password</b>`, // html body
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log(`Message: ${info.messageId}`);
                        console.log(`sent: ${info.response}`);
                    });
                });
                res.send({status: 'success', message: true, data: obj});
            } else {
                console.log('please register your account');
                res.send({status: 'success', message: false});
            }

        }
    });
}
function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}
function distance(lat1,lng1,lat2,lng2){
    var rLat1 = toRadian(lat1);
    var rLng1 = toRadian(lng1);
    var rLat2 = toRadian(lat2);
    var rLng2 = toRadian(lng2);
    // alert(rLat1+" "+ rLng1+" "+rLat2+" "+rLng2)
    var dis = Math.acos(Math.sin(rLat1)*Math.sin(rLat2) + Math.cos(rLat1)*Math.cos(rLat2)*Math.cos(rLng1-rLng2));
    // alert(6371*dis);
    return 6371*dis;
}
function toRadian(l){
    return radian = l*3.1415926/180;
}
function createPassword(min,max) {
    var num = ["0","1","2","3","4","5","6","7","8","9"];
    var english = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    var ENGLISH = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    var special = ["-","_","#"];
    var config = num.concat(english).concat(ENGLISH).concat(special);
    var arr = [];
    arr.push(getOne(num));
    arr.push(getOne(english));
    arr.push(getOne(ENGLISH));
    arr.push(getOne(special));
    var len = min + Math.floor(Math.random()*(max-min+1));
    for(var i=4; i<len; i++){
        arr.push(config[Math.floor(Math.random()*config.length)]);
    }
    var newArr = [];
    for(var j=0; j<len; j++){
        newArr.push(arr.splice(Math.random()*arr.length,1)[0]);
    }
    function getOne(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }
    return newArr.join("");
}