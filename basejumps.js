
var express = require('express');
var url = require('url');
var fs = require('fs')
var path = require('path')
var multer  = require('multer')
var parser = require('ua-parser-js');
var mongoose = require('mongoose');
var shorturl = require('./store/shurl'); 

var upload = multer({ dest: 'pub/uploads/' });

var app = express();
app.set('view engine', 'jade');
app.set('views', './pub/views');

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

app.get('/shurl', function (req, res) {
  res.render('shurl');
});

app.get('/shurl/new/*', function (req, res) {
    var pathname = url.parse(req.url).pathname.substring(11);
    shorturl("genShort", pathname, function (result) {
        res.end(result);
        return;
    });
});

app.get('/short/*', function (req, res) {
    var pathname = url.parse(req.url).pathname.substring(7);
    shorturl("getShort", pathname, function (result) {
        if (result.hasOwnProperty('error')) {
            res.end(JSON.stringify(result));
        } else {
            var orig = result[0].original;
            var parsed = url.parse(orig);
            var red_url = !parsed.protocol? "http://"+orig : orig;
            res.redirect(301, red_url);
        }
    });
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

app.post('/upload', upload.single('fileup'), function (req, res, next) {
        res.render("confirm", {filesize: "File size: "+req.file.size+" bytes"});
        next();
    }, function (req, res) {
        fs.unlink(path.resolve(req.file.path), function (err) {
            if (err){
                console.log('Error encountered while removing the file');
            } else {
                console.log('file deleted');
            }
        })
    }
);

app.get('/metadata', function (req, res) {
  res.render('metadata');
})

app.all('/*', function (req, res) {
  res.render('index');
});

  var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});