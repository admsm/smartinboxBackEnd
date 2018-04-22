var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config');
var redis = require('../helpers/redis');
var validate = require('../helpers/validateRequest');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query.email){
		var token = jwt.encode(req.query.email, config.appSecret);
		var response = {};
		redis.client.hmset(["user:"+req.query.email,"jwtToken",token], function (err, res) {
			if (err) throw new Error(err);
		});
		response.token = token;
		response.status = 201;
		res.status(201).send(response);
	}
	else{
		var errResponse = {};
		errResponse.message = "Email Id is not provided";
		errResponse.status = 501;
		res.send(errResponse);
	}
});

/* GET home page. */
router.get('/appAuth', isAuthenticated, function(req, res, next) {
	if(req.query.email){
		var token = jwt.encode(req.query.email, config.appSecret);
		var response = {};
		redis.client.hmset(["user:"+req.query.email,"jwtToken",token], function (err, res) {
			if (err) throw new Error(err);
		});
		response.token = token;
		response.status = 201;
		res.status(201).send(response);
	}
	else{
		var errResponse = {};
		errResponse.message = "Email Id is not provided";
		errResponse.status = 501;
		res.send(errResponse);
	}
});

router.get('/ui', function(req, res, next) {
  	res.render('index', { title: 'Express' });
});

module.exports = router;
