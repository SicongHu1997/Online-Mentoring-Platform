var mongoose = require ("mongoose");
mongoose.Promise = global.Promise;
var urlstring =
    'mongodb://sicongh:hundanzhiwange1997@ds055594.mlab.com:55594/storm';
mongoose.connect(urlstring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + urlstring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + urlstring);
    }
});
module.exports = mongoose;