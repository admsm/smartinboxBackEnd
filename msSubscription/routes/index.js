var express = require('express');
var router = express.Router();
var subscription = require('../models/subscription')
var mongo = require('../helpers/mongo');
var validate = require('../helpers/validateRequest');
var jwt = require("jwt-simple");


function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}

router.get('/createSubscription', isAuthenticated,function(req, res, next) {
  	if(req.query.email){
		//console.log(req.query.email);
  		subscription.createSubscription(req.query.email,res, next,function(statusCode,result){
			res.statusCode = statusCode;
    		res.send(result);
    	});	
  	}
});

router.get('/updateSubscription', isAuthenticated,function(req, res, next) {
  	if(req.query.email){
		subscription.updateSubscription(req.query.email,function(statusCode,result){
    		res.statusCode = statusCode;
    		res.send(result);
	    });	
  	}
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
