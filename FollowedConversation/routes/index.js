var express = require('express');
var router = express.Router();
var followedConvo = require("../controllers/followedConversation");
var validate = require('../helpers/validateRequest');


function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}


/* GET home page. */
router.get('/',isAuthenticated, function(req, res, next) {
    if(req.query.teamMemberEmail && req.query.teamEmail){
		followedConvo.getFollowedConvo(req.query,function(result){
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

router.post('/',isAuthenticated, function(req, res, next) {
    if(req.body.conversationId && req.body.teamMemberEmail && req.body.teamEmail){
		followedConvo.followConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'teamMemberEmail, conversationId or teamEmail is Missing';
		res.send(response);
	}
});

router.delete('/',isAuthenticated, function(req, res, next) {
    if(req.body.conversationId && req.body.teamMemberEmail && req.body.teamEmail){
		followedConvo.unFollowConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'teamMemberEmail, teamEmail or conversationId is Missing';
		res.send(response);
	}
});

module.exports = router;
