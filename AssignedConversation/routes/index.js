var express = require('express');
var router = express.Router();
var assignedConversation = require("../controllers/assignedConversation");
var validate = require('../helpers/validateRequest');
var config = require("../config");
var request = require('request');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}

/* GET home page. */
router.get('/',isAuthenticated, function(req, res, next) {
  	if(req.query.teamMemberEmail && req.query.teamEmail){
		assignedConversation.getConvo(req.query,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'teamMemberEmail or teamEmail is Missing';
		res.send(response);
	}
});

function checkIfDeactivatedUser(data,token,callback){
	var options = { 
		method: 'GET',
		url: config.teamMemberUrl + '/',
		qs: { teamEmail: data.teamEmail },
		headers: 
		{ 'content-type': 'application/json',
			authorization: 'Bearer '+token },
		json: true };
	// 
	request(options, function (error, response, body) {
		//console.log(error,body);
		if (error) {
			callback(false);
		}
		else if(body.length > 0){
			callback(true);
		}
		else {
			callback(false);
		}
		
	});
}


router.post('/',isAuthenticated, function(req, res, next) {
	if(req.body.teamMemberEmail && req.body.conversationId && req.body.teamEmail){
		checkIfDeactivatedUser(req.body,req.headers.authorization.split(' ')[1],function(flag){
			// check here teamMember is block in this team or not.
			if(flag){
				assignedConversation.assignConvo(req.body,function(result){
					res.send(result);
				});
			}
			else{
				var response = {};
				response.status = '201';
				response.message = 'User is deactivated. App can not assign.';
				res.send(response);
			}
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'teamMemberEmail or conversationId is Missing';
		res.send(response);
	}
});

module.exports = router;
