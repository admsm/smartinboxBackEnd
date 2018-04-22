var express = require('express');
var router = express.Router();
var config = require("../config")
var accessToken = require('../models/accessToken');
var request = require("request");

/* GET authorization*/
router.get('/',function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* GET authorization*/
router.get('/authorize', function(req, res, next) {
	var url = "https://"+config.microsoftOAuthUrl + "/authorize" + 
			"?client_id=" + config.clientId +
			"&scope=" + config.scope +
			"&response_type=code" +
			"&redirect_uri=" + config.redirectUri;
	res.redirect(url);
});

/* GET access token*/
router.get('/getAccessToken', function(req, res, next) {
	//console.log(req.query);
	
	if(req.query.code){
		accessToken.getAccessTokenFrmCode(req.query.code,function(statusCode, result) {
			
			console.log(result);
			// res.send('successfull');
			// return;
			if(result && result.access_token && result.refresh_token){
				let options = {
		        	maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 15 minutes
		        	httpOnly: false, // The cookie only accessible by the web server
		        	path : "/",
		        	//domain : config.cookieDomain
		        }
		    	res.cookie('MsT', result.access_token, options) // options is optional
				res.cookie('MsRef', result.refresh_token, options) // options is optional

				//console.log('djskjdks');
				var request = require("request");

				var requestOptions = { method: 'GET',
				  url: 'https://graph.microsoft.com/v1.0/me',
				  headers: 
				   { authorization: result.access_token } };

				 var msAccessTokenInfo = result;

				request(requestOptions, function (error, response, body) {
					body = JSON.parse(body);
				  	//console.log(body);
				  	if (error) throw new Error(error);
				  	//console.log(msAccessTokenInfo);
				  	let email = '';
				  	let name = 'Rockstar';
			  		
			  		if(body.mail){
			  			email = body.mail;
			  		}
			  		else if(body.userPrincipalName){
			  			email = body.userPrincipalName;
			  		}

			  		if(body.displayName){
			  			name = body.displayName;
			  		}
			  		else if(body.givenName){
			  			name = body.givenName;
			  		}


			  		if(email != '' && email != 'undefined'){
			  			//console.logconsole.log(msAccessTokenInfo);
			  			requestToSetJWT(email,name,body,res,msAccessTokenInfo);
			  		}
			  		else{
			  			var result = {};
						result.message = "Not able to connect to Microsoft.";
						res.statusCode = 501;
				    	res.send(result);
			  		}

			  	});
			}
			else{
				var result = {};
				result.message = "something went wrong.";
				res.statusCode = 501;
		    	res.send(result);
			}
		});
	}
	else if(req.query.refreshToken){
		accessToken.getAccessTokenFrmRefreshToken(req.query.refreshToken,function(statusCode, result) {
		    res.statusCode = statusCode;
		    res.send(result);
		});
	}
	else{
		var result = {};
		result.message = "Invalid Request.";
		res.statusCode = 501;
		res.send(result);
	}
});


function requestToSetJWT(email,name,userData,res,msAccessTokenInfo){
	//console.log(msAccessTokenInfo);
	var requestOptions = { method: 'GET',
	  url: config.appAuthUrl+"?email="+email
	};

	request(requestOptions, function (error, response, body) {
	  if (error) throw new Error(error);
	  	body = JSON.parse(body);
	  	//console.log(body);
	  	let options = {
        	maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 15 minutes
        	httpOnly: false, // The cookie only accessible by the web server
        	path : "/",
        	//secure : true //this should get on when migrated to the server.
        	//domain : config.cookieDomain
        }

    	res.cookie('SmartInboxToken', body.token, options) // options is optional
	  	requestToGetTeamMate(email,name,userData,msAccessTokenInfo,res,body.token);
	});
}

function requestToGetTeamMate(email,name,userData,msAccessTokenInfo,res,token){
	//console.log(msAccessTokenInfo);
	var options = { 
		method: 'GET',
		url: config.teamMateUrl+'/teammates/'+ email,
		headers: 
   		{ authorization: 'Bearer '+ token }
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
		
	 	body = JSON.parse(body);
		
		if(!(body[0] && body[0].teamMemberEmail)){ // if team mate does not exist
			//console.log('dhsjhdjshdj');
			requestToInsertTeamMate(email,name,userData,msAccessTokenInfo,res,token);	
		}

		res.redirect("http://localhost:4200?userData="+encodeURIComponent(JSON.stringify(userData))+"&appToken="+token+"&msAccessToken="+msAccessTokenInfo.access_token+"&msRefreshToken="+msAccessTokenInfo.refresh_token );
		
		
	});
}

function requestToInsertTeamMate(email,name,userData,msAccessTokenInfo,res,token){

	var teamMemberName = '';
	if(userData.displayName)
		teamMemberName = userData.displayName; 
	else if(userData.givenName)
		teamMemberName = userData.givenName;
	else
		teamMemberName = 'Anonymous';

	var options = { 
		method: 'POST',
		url: config.teamMateUrl+'/internalInsert',
		body: {teamEmail : null, teamMemberEmail : email, teamMemberName : teamMemberName, userEmail : email},//JSON.stringify(dataToBeInserted),
		headers: 
		   { authorization: 'Bearer '+ token },
		json: true 
	};
	request(options, function (error, response, body) {
		console.log(error,response);
	});
}

module.exports = router;