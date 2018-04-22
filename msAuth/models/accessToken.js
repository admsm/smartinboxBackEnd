var restApiCalls = require("./restApiCalls");
var querystring = require("querystring");
var config = require("../config");

exports.getAccessTokenFrmCode = function(code,resultFunc)
{
    // Build the post string from an object
    var postData = querystring.stringify({
        'client_id' : config.clientId,
        'redirect_uri': config.redirectUri,
        'client_secret': config.clientSecret,
        'code' : code,
        'grant_type' : 'authorization_code'
    });

    // An object of options to indicate where to post to
    var postOptions = {
        host: config.microsoftLoginUrl,
        path: config.microsoftOAuthPart + '/token',
        port : 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    restApiCalls.request(postOptions, function(statusCode, result) {
        resultFunc(statusCode,result);
    },postData);
};

exports.getAccessTokenFrmRefreshToken = function(code,resultFunc)
{
    // Build the post string from an object
    var postData = querystring.stringify({
        'client_id' : config.clientId,
        'redirect_uri': config.redirectUri,
        'client_secret': config.clientSecret,
        'refresh_token' : code,
        'grant_type' : 'refresh_token'
    });

    // An object of options to indicate where to post to
    var postOptions = {
        host: config.microsoftLoginUrl,
        path: config.microsoftOAuthPart + '/token',
        port : 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    restApiCalls.request(postOptions, function(statusCode, result) {
        resultFunc(statusCode,result);
    },postData);
};
