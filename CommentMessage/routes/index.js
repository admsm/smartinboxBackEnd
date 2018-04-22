var express = require('express');
var router = express.Router();
var commentMessage = require("../models/commentmessage");

/* GET home page. */
router.post('/', function(req, res, next) {
	
	if(req.body.comment && req.body.messageId && req.body.teamMemberEmail && req.body.teamEmail){
		commentMessage.postComment(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Comment, MessageId, TeamMemberEmail or TeamEmail is Missing';
		res.send(response);
	}
	
});

router.get('/', function(req, res, next) {
	if(req.query.messageId && req.query.teamEmail){
		commentMessage.getComments(req.query,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Message Id or Team Email is Missing';
		res.send(response);
	}
});

module.exports = router;
