var express = require('express');
var googlemaps = require ("googlemaps");
var bodyParser = require('body-parser');
var session = require('express-session');

const multer = require("multer");
const controller=require('../controllers/controller')

var mongoose = require ("mongoose");
var urlstring =
    'mongodb://sicongh:hundanzhiwange1997@ds055594.mlab.com:55594/storm';
mongoose.connect(urlstring);



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.myid+".jpg")
    }
});
var upload = multer({ storage: storage });

var router = express.Router();
router.use(express.static('public'));
router.use(bodyParser.urlencoded({extended:true}))
router.use(session({
    secret :  'secret',
    resave : true,
    saveUninitialized: false,
    cookie : {
        maxAge : 1000 * 60 * 60,
    },
}));

router.get('/',function(req,res){
    res.render('index')
});
router.get('/register',function(req,res){
    res.render('register')
});
router.get('/forget_pwd',function(req,res){
    res.render('forget_pwd')
});

router.get('/password', controller.password);
router.get('/logout', controller.logout);
router.get('/recentmessage', controller.recentMessage);
router.get('/resultgrid', controller.resultgrid);
router.get('/chat/:key?', controller.chatKeys);
router.get('/profile/:key?', controller.profileKeys);
router.get('/search',controller.search);
router.get('/editprofile', controller.editProfile);

router.post('/', controller.index);
router.post('/register', controller.register);
router.post('/forget_pwd',controller.forget_pwd);
router.post('/process', controller.process);
router.post('/message', controller.message);
router.post('/process_search', controller.process_search);
router.post('/edit',upload.single("photo"),controller.edit);
router.post('/recchat', controller.recchat);
router.post('/refreshchat', controller.refreshchat);
router.post('/password',controller.passwordPOST);


module.exports = router;
