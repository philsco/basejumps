
var mongoose = require('mongoose');
var urlString = 'mongodb://'+process.env.MONGOLAB_USER+':'+process.env.MONGOLAB_PASS+'@ds033145.mongolab.com:33145/fcc_challenges';
if (!shurlSchema) {
    console.log('creating schema')
    var shurlSchema = new mongoose.Schema({
            original: {type: String, trim: true},
            shurl: {type: String, trim: true},
            shid: {type: String}
            });
    }

if (mongoose.connection.readyState !== 1) {
    mongoose.connect(urlString, function (err, res) {
        if (err) {
            console.log('err on connect');
            callback({"error":"Connection", "message":"Experiencing database connecivity issues, please try again"});
        } else {
            console.log('successfully connected')                
            }
        });
    };
    
    
module.exports = function (action, payload, callback) {
    if (action === "genShort") {
        var master = new RegExp(/^(http(s)?:\/\/)?(www\.)?[a-z0-9\-\.]{3,}\.[a-z]+(\/[a-z0-9-_~]+)?$/);          
        if (!master.test(payload)) {
            callback (JSON.stringify({"error":"invalid", "message":"no valid URL provided"}));   
        } else {
            var ShUrl = mongoose.model('ShortUrls', shurlSchema);
            ShUrl.count({}, function (err, count) {
                if (err) {
                    callback(JSON.stringify({"error": "save", "message": "Error on saving new URL. Please try again"}));
                } else {
                    var newShort = new ShUrl();
                    newShort.original = payload; 
                    count++;
                    newShort.shurl =  "http://radiant-dawn-8754.herokuapp.com/short/"+count;
                    newShort.shid = count.toString();
                    newShort.save(function (err) {
                        if (err) {
                            callback(JSON.stringify({"error": "save", "message": "Error on saving new URL. Please try again"}));
                        } else {
                            callback(JSON.stringify({"original_url": newShort.original, "short_url":newShort.shurl}));
                        }
                    })
                }
            });
        }   
        } else {
        var master = new RegExp(/^[0-9]+$/);    
        if (!master.test(payload)) {
            callback (JSON.stringify({"error":"invalid", "message":"not a valid short URL."}));   
        } else {
            var ShUrl = mongoose.model('ShortUrls', shurlSchema);
            ShUrl.find({'shid': payload}).exec(function(err, result) {
                if (err || result.length === 0) {
                    callback({"error":"invalid", "message":"No such short URL on record"});
                    return;
                } else {
                    callback(result);
                    return;
                } 
            });
           }
         }
    }
    
