var express = require('express');
var router = express.Router();
var config = require("../config")
var accessToken = require('../models/accessToken');
var validate = require('../helpers/validateRequest');
var jwt = require("jwt-simple");
var redis = require("../helpers/redis");

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}


/* GET home page. */
router.get('/', isAuthenticated,function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET authorization*/
router.get('/authorize', isAuthenticated, function(req, res, next) {
	
	if(req.query.sharedEmail){
		var email = res.locals.loggedInEmail;
		//var email = 'gadhoc@adobe.com'; // this has to be replace by jwt.decode(req.headers.authorization.split(' ')[1],config.appSecret)
		redis.client.set(req.query.sharedEmail,email); // temperary set email value

		var url = "https://"+config.microsoftOAuthUrl + "/authorize" + 
		"?client_id=" + config.clientId +
		"&scope=" + config.scope +
		"&response_type=code" +
		"&redirect_uri=" + config.redirectUri;

		res.redirect(url);
	}
	else{
		var response = {};
		response.statusCode = 401;
		response.message = "Shared Email is missing !";
		res.send(response);
	}
});


/* GET access token*/
router.get('/getAccessToken', function(req, res, next) {
	
	if(req.query.code){
		accessToken.getAccessTokenFrmCode(req.query.code,function(statusCode, result) {

		    res.statusCode = statusCode;
		    res.send(result);
		});
	}
	else if(req.query.email){
		//console.log(req.query.email);
		accessToken.getAccessTokenFrmRefreshToken(req.query.email,function(statusCode, result) {
		    res.statusCode = statusCode;
		    res.send(result);
		});
	}
	else if(req.query.error){
		var result = {};
		result.error = req.query.error;
		result.error_description = req.query.error_description;
		res.statusCode = '400';
		res.send(result);
	}
});



module.exports = router;
