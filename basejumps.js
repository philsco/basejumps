
var express = require('express');
var url = require('url');
var parser = require('ua-parser-js');

var app = express();
app.set('view engine', 'jade');
app.set('views', './pub/views');

/*
app.use('/static', express.static(__dirname + '/pub'));
*/

var months = {
    "Jan": "January", 
    "Feb": "February", 
    "Mar": "March", 
    "Apr": "April", 
    "May": "May", 
    "Jun": "June", 
    "Jul": "July", 
    "Aug": "August", 
    "Sep": "September", 
    "Oct": "October", 
    "Nov": "November", 
    "Dec": "December"
}


app.get('/timestamp', function (req, res) {
   res.render('times') 
});

app.get('/timestamp/*', function (req, res) {
    var pathname = url.parse(req.url).pathname.substring(1);
    var payload = function () {
        var baseDate = new Date(decodeURI(pathname));
        if (baseDate == "Invalid Date") {
            return '{"unix":null,"natural":null}';
        } else {
            var utcArr = new Date(baseDate).toUTCString().split(' ');
            var yr = utcArr[3];
            var mo = months[utcArr[2]];
            var dd = parseInt(utcArr[1]);            
            return {
                "unix": new Date(baseDate).getTime()/1000,
                "natural":  mo+" "+dd+", "+yr
            } 
        }
    }
    res.send(payload());
});

app.get('/header', function (req, res) {
    var ua = parser(req.headers['user-agent']);
    var payload = {};
    var ipAddr = req.headers["x-forwarded-for"];
      if (ipAddr){
        var list = ipAddr.split(",");
            payload.ipaddress = list[list.length-1];
        } else {
            payload.ipaddress = req.connection.remoteAddress;
     }
     payload.software = ua.os.name + " " + ua.os.version;
//     payload.ipaddress = req.ip;  // Doesn't work on Heroku
     payload.language = req.headers["accept-language"].split(',')[0];
     res.send('<pre>' + JSON.stringify(payload) + '</pre>');
});


app.all('/*', function (req, res) {
  res.render('index');
});

  var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});