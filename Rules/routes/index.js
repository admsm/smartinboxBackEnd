var express = require('express');
var router = express.Router();
var rulesModel = require('../models/rules');
var validate = require('../helpers/validateRequest');
var jwt = require("jwt-simple");
var redis = require("../helpers/redis");

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST rules */
router.post('/',isAuthenticated, function(req, res, next) {
	if(!parseInt(res.locals.isOwner)){
		res.status(501).send({'message' : 'You does not have authority to create rules. Only Admins has this authority.' , 'status' : '501'});
	}
	

	if(req.body.conditionType !== 'or' && req.body.conditionType !== 'and'){
  		res.status(501).send({'message' : 'conditionType can not be other than or & and.' , 'status' : '501'});
    }
    else if(req.body && req.body.event && req.body.conditions && req.body.result && req.body.conditionType && req.body.teamEmail){
  		rulesModel.postRules(req.body,res, next,function(statusCode,result){
			res.statusCode = statusCode;
    		res.send(result);
    	});	
    }
    else{
    	res.status(501).send({'message' : 'Event,conditions,result, conditiontype or team email is missing.' , 'status' : '501'});
	}
});


/* POST rules */
router.post('/checkRules', function(req, res, next) {
	//console.log(req.body);
 	if(req.body){
 		rulesModel.checkRules(req.body,res, next,function(statusCode,result){
			res.statusCode = statusCode;
    		res.send(result);
    	});	
 	}
 	else{
 		res.status(501).send({'message' : 'No input provided !!' , 'status' : '501'})
 	}
});

/* GET home page. */
router.get('/rules',isAuthenticated, function(req, res, next) {
	if(req.query.teamEmail){
		rulesModel.getRules(req.query,res, next,function(statusCode,result){
		   res.statusCode = statusCode;
		   res.send(result);
	   });	
	}
	else{
		rulesModel.getRules(req.query,res, next,function(statusCode,result){
			res.statusCode = statusCode;
			res.send(result);
		});
	}
});

module.exports = router;
