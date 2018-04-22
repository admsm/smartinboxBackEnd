var express = require('express');
var router = express.Router();
var archeive = require("../models/archeiveConversation");
var validate = require('../helpers/validateRequest');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}

/* GET home page. */
router.post('/', isAuthenticated, function(req, res, next) {
	
	if(req.body.conversationId && req.body.teamEmail){
		archeive.archeiveConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Conversation Id is Missing';
		res.send(response);
	}
	
});

router.get('/', isAuthenticated,function(req, res, next) {
	if(req.query.teamEmail){
		archeive.getArcheiveConvoByTeamMember(req.query,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Team Email Id is Missing';
		res.send(response);
	}
	
});


router.delete('/', isAuthenticated, function(req, res, next) {
	if(req.body.conversationId && req.body.teamEmail){
		archeive.unArchieveConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Team Member Email Id is Missing';
		res.send(response);
	}
	
});

module.exports = router;
