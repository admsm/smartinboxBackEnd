var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.request = function(options, onResult,postData = {})
{
    var protocol = options.port == 443 ? https : http;
    var req = protocol.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log(err);
        var resp = {};
        resp.statusCode = 501;
        resp.message = err.message;
        onResult(501,resp);
    });
    
    if(Object.keys(postData).length != 0){
        req.write(postData);
    }
    req.end();
};