
var request = require("request");
var mongoose = require('mongoose');

var urlString = 'mongodb://'+process.env.MONGOLAB_USER+':'+process.env.MONGOLAB_PASS+'@ds033145.mongolab.com:33145/fcc_challenges';
if (!schSchema) {
    console.log('creating schema')
    var schSchema = new mongoose.Schema({
            schdate : { type : Date, default: Date.now },
            schquery: {type: String, trim: true}
            });
    }
    
var PixaReq = function (queryObj) {
    this.q = queryObj.q;
    this.p = queryObj.p
    this.per_page = 10;
    this.image_type = "photo";
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
    if (action === "saveQuery") {
    var pixareq = new PixaReq(payload); 
    var Schq = mongoose.model('SearchQs', schSchema);
    var newQuery = new Schq();
    newQuery.schdate = new Date();
    newQuery.schquery = pixareq.q.join(" ");
    newQuery.save(function (err) {
        if (err) {
            callback(JSON.stringify({"error": "save", "message": "Error on saving the query. Please try again."}));
        } else {
            var pixareq = new PixaReq(payload); 
            var pixaUrl = "https://pixabay.com/api?key="
                        +encodeURIComponent(process.env.PIXABAY_KEY)
                        +"&q="+encodeURIComponent(pixareq.q.join("+").toString())
                        +"&image_type=photo&per_page=10&page="
                        +encodeURIComponent(pixareq.p);
            request.get(pixaUrl, (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                callback(JSON.stringify(body));
            } else {
                callback(JSON.stringify({"error":"api", "message":"Experienced an error with the image search API"}));
                }
            });
        }
        });   
    } else {
      var Schq = mongoose.model('SearchQs', schSchema);
        Schq.find({}).sort('-schdate').limit(10).exec(function(err, result) {
            if (err || result.length === 0) {
                callback({"error":"data", "message":"No results"});
                return;
            } else {
                callback(JSON.stringify(
                    result.map((item) => {
                    return {"terms": item.schquery, "submitted": item.schdate};
                    })
                ));
                return;
            } 
        });
        }
    }
    
