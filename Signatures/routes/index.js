var express = require('express');
var router = express.Router();
var signatures = require("../models/signatures")
var validate = require('../helpers/validateRequest');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}
/* GET home page. */
router.get('/',isAuthenticated, function(req, res, next) {
		if(req.query.id){
			var data = {};
			data = {"_id":res.query.id,'isActive':1};
			signatures.getSignature(data,req,res,function(result){});
		}
		else{
			var data = {};
			data = {"teamMemberEmail":res.locals.loggedInEmail,'isActive':1};
			signatures.getSignature(data,req,res,function(result){});
		}
});

router.post('/',isAuthenticated, function(req, res, next) {
	
    if(req.body.name && req.body.content && req.body.info){
		var data = {};
		data.name = req.body.name;
		data.content = req.body.content;
		data.info = req.body.info;
		//console.log(res.locals);
		data.teamMemberEmail = res.locals.loggedInEmail;
		//console.log(data);
      signatures.postSignature(data,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Signature Name or Content is Missing';
		res.send(response);
	}
});

router.delete('/', function(req, res, next) {
    if(req.body.id){
		var update = {'isActive':0};
		var conditions = {'_id' : req.body.id};
	
      	signatures.updateSignature(conditions,update,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Signature Id is Missing';
		res.status(response.status).send(response);
	}
});


router.put('/', function(req, res, next) {

	if(req.body.id && req.body.signatureContent){

		var update = {'signatureContent':req.body.signatureContent};
		var conditions = {'_id' : req.body.id};
	
		signatures.updateSignature(conditions,update,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Signature Id or Content is Missing';
		res.status(response.status).send(response);
	}
});

module.exports = router;
