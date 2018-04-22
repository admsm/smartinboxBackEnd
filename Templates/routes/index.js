var express = require('express');
var router = express.Router();
var template = require("../models/templates")
var validate = require('../helpers/validateRequest');

function isAuthenticated(req,res,next){
	validate.authorizeUser(req,res,next);
}


/* GET home page. */
router.get('/',isAuthenticated, function(req, res, next) {
    if(req.query.id){
		template.getTemplate(req.query,function(statusCode,result){
			res.status(statusCode).send(result);
		});
	}
	else if(req.query.email){
		template.getTemplateByEmail(req.query,function(statusCode,result){
			res.status(statusCode).send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Template Id is Missing';
		res.send(response);
	}
});

router.post('/',isAuthenticated, function(req, res, next) {
    if(req.body.templateName && req.body.templateContent && req.body.teamEmail){
		template.postTemplate(req.body,function(statusCode,result){
			res.status(statusCode).send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Template Name or Content or TeamEmail is Missing';
		res.send(response);
	}
});

router.delete('/',isAuthenticated, function(req, res, next) {
    if(req.body.id){
		template.deleteTemplate(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Template Id is Missing';
		res.status(response.status).send(response);
	}
});


router.put('/',isAuthenticated, function(req, res, next) {
	
	if(req.body.id && req.body.templateContent){
		template.updateTemplate(req.body,function(result){
			res.send(result);
		});
	}
	else{
		var response = {};
		response.status = '400';
		response.message = 'Template Id or Content is Missing';
		res.status(response.status).send(response);
	}
});

module.exports = router;
