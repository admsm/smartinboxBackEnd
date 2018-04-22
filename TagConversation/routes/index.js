var express = require('express');
var router = express.Router();
var tag = require('../controllers/tagconversation');
var validate = require('../helpers/validateRequest');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}


router.post('/',isAuthenticated, function(req, res, next) {
	
	if(req.body.tagName && req.body.conversationId && req.body.teamMemberEmail && req.body.teamEmail){
		tag.tagConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Tag Name,Team Email,Conversation Id or User Email is Missing';
		res.send(response);
	}
	
});

router.get('/',isAuthenticated, function(req, res, next) {
	if(req.query.conversationId && req.query.teamEmail){
		tag.getTagsForConvo(req.query,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Conversation Id or Team Email is Missing';
		res.send(response);
	}
	
});

router.put('/',isAuthenticated, function(req, res, next) {
	if(req.body.newTagName && req.body.oldTagName && req.body.conversationId  && req.body.teamEmail){
		tag.updateTag(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'New Tag Name,Old Tag Name,Team Email or Conversation Id is Missing';
		res.send(response);
	}
	
});

router.delete('/',isAuthenticated, function(req, res, next) {
	if(req.body.tagName && req.body.conversationId  && req.body.teamEmail){
		tag.unTagConvo(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Tag Name,Team Email or Conversation Id is Missing';
		res.send(response);
	}
	
});

module.exports = router;
