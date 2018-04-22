var restApiCalls = require("../helpers/restApiCalls");
var querystring = require("querystring");
var config = require("../config");
var redis = require("../helpers/redis");
var request = require("request");


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
        console.log(result);

        if(result.access_token && result.refresh_token){
            
            var graphUserPostOption = {
                    host: config.graphApiUrl,
                    path : '/v1.0/me',
                    port : 443,
                    method : 'GET',
                    headers: {
                            'Authorization': result.access_token
                    }
            };
            
            restApiCalls.request(graphUserPostOption, function(statusCode, graphResult) {
                var userEmail = '';
                if(graphResult.mail){
                    userEmail = graphResult.mail;
                }
                else if(graphResult.userPrincipalName){
                    userEmail = graphResult.userPrincipalName;
                }
                //console.log(result);
                if(userEmail !== '' && result.refresh_token && result.access_token){
                    redis.client.hmset(["user:"+userEmail,"refreshToken",result.refresh_token,"accessToken", result.access_token], function (err, res) {
                        if(err){
                            resultFunc('400',{'error':'Invalid Insertion','errorMessage':'Could not able to store into Redis.'});
                            return;
                        }
                        var resp = {};
                        resp.message = 'return to db sync';  
                        resp.statusCode = 201;
                        resultFunc(statusCode,resp);

                    });

                    // userEmail here means the shared email added 
                    redis.client.get(userEmail,function(err, reply) {
                        
                        if(err) throw new Error(err);

                        // get the token
                        redis.client.hgetall('user:'+userEmail,function(error1,obj){
                            if(error1) throw new Error(error1);

                            // add to team.
                            var teamOptions = { 
                                
                                method: 'POST',
                                url: config.teamUrl + '/teams',
                                
                                headers: 
                                { 'content-type': 'application/json' },
                                
                                body: 
                                { 
                                    teamName: userEmail.split('@')[0],
                                    teamEmail: userEmail,
                                    userEmail: reply 
                                },
                                
                                json: true 
                            };

                            request(teamOptions, function (error2, response, body) {
                              if (error2) throw new Error(error2);
                                
                                console.log(body);
                            });

                            

                            // update the teammember with teamEmail.
                            var teamMemberUpdateOptions = { 
                                method: 'PUT',
                                url: config.teamMemberUrl + '/teammates/'+reply,
                                headers: 
                                { authorization: 'Bearer '+obj.jwtToken,
                                 'content-type': 'application/json' },
                                body: { teamEmail: userEmail, isOwner : 1 },
                                json: true 
                            };

                            request(teamMemberUpdateOptions, function (error3, response, body) {
                              if (error3) throw new Error(error3);
                                    console.log(body);
                            });


                        });
                    
                    });
                }
                else{
                    resultFunc('400',{'error':'Invalid Insertion','errorMessage':'Could not able to store into Redis.'});
                }

            });
        }
            
    },postData);
};

exports.getAccessTokenFrmRefreshToken = function(email,resultFunc)
{
	redis.client.hgetall('user:'+email,function(err,obj){
		
		if(err){
			resultFunc(statusCode,err.message);
		}

        if(!obj){
            resultFunc("400",{code : "400",message : "Email id not registered"});
        }
        else{
            var code = obj.refreshToken;
            
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
                if(email && result && result.refresh_token){
                    redis.client.hmset(["user:"+email,"refreshToken",result.refresh_token,"accessToken", result.access_token,"expirationTime",Date.now()+((result.expires_in - 10)*1000)], function (err, obj1) {
                        if(err || !obj1){
                            resultFunc('400',{'error':'Invalid Fetch','errorMessage':'Could not able to fetch the Redis Data.'})
                        }
                    });
                    resultFunc(statusCode,result);
                }
                else if(result && result.statusCode == 501 && result.message){
                    resultFunc(501,result);
                }	
                else{
                    console.log(result);
                    resultFunc(501,{'statusCode':501,'message':'Could not able to get the refresh token from Microsoft.'});
                }
            },postData);
        }
	});
};
