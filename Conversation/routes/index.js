var express = require('express');
var router = express.Router();
var conversation = require("../models/conversation");

// router.get('/',function(req,res,next){
// 	res.render('index', { title: 'Express' });
// });



/* GET home page. */
router.get('/all', function(req, res, next) {
  	if(req.query.email != "undefined" && req.query.lastDate != "undefined" && req.query.email && req.query.lastDate){
  		conversation.getAllMessage(req.query, res, next,function(statusCode, result) {
            res.statusCode = statusCode;
            res.send(result);
         });
  	}
  	else{
  		var resp = {};
  		resp.statusCode = 501;
  		resp.message = "Either email or lastDate is not mentioned";
  		res.status(501).send(resp);
  	}
});

/* GET home page. */
router.get('/syncDB', function(req, res, next) {
    if(req.query.email != "undefined" && req.query.lastDate != "undefined" && req.query.email && req.query.lastDate){
      conversation.getAllMessageByFolder(req.query, res, next,function(statusCode, result) {
            res.statusCode = statusCode;
            res.send(result);
         });
    }
    else{
      var resp = {};
      resp.statusCode = 501;
      resp.message = "Either email or lastDate is not mentioned";
      res.status(501).send(resp);
    }
});

/* GET home page. */
router.post('/mailFolders', function(req, res, next) {
  if(req.body){
    console.log(req.body);
    conversation.insertToMailFolders(req.body,req.query.teamEmail, res, next,function(statusCode, result) {
          res.statusCode = statusCode;
          res.send(result);
       });
  }
  else{
    var resp = {};
    resp.statusCode = 501;
    resp.message = "No Folders To Insert";
    res.status(501).send(resp);
  }
});

/* GET home page. */
router.get('/mailFolders', function(req, res, next) {
  if(req.query){
    conversation.getMailFolder(req.query, res, next,function(statusCode, result) {
          res.statusCode = statusCode;
          res.send(result);
       });
  }
  else{
    var resp = {};
    resp.statusCode = 501;
    resp.message = "No Folders To Insert";
    res.status(501).send(resp);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    if(req.query.email != "undefined" && req.query.email){
      conversation.getAllConvoFromDB(req.query, res, next,function(statusCode, result) {
            res.statusCode = statusCode;
            res.send(result);
         });
    }
    else{
      var resp = {};
      resp.statusCode = 501;
      resp.message = "Email is missing";
      res.status(501).send(resp);
    }
});

/* GET home page. */
router.get('/getTrash', function(req, res, next) {
  
  if(req.query.email != "undefined" && req.query.email){
    conversation.getTrashConvoFromDB(req.query, res, next,function(statusCode, result) {
          res.statusCode = statusCode;
          res.send(result);
       });
  }
  else{
    var resp = {};
    resp.statusCode = 501;
    resp.message = "Email is missing";
    res.status(501).send(resp);
  }
});


/* GET home page. */
router.post('/trash', function(req, res, next) {
  //console.log(req.query);
  if(req.body.conversationId && req.body.teamEmail){
      var data = {};
      data.conversationId = req.body.conversationId;
      data.teamEmail = req.body.teamEmail;

      var updateData = {};
      updateData.isActive = false;
      
      conversation.updateDataById(data,updateData, res, next,function(statusCode, result) {
          res.statusCode = statusCode;
          res.send(result);
       });
  }
  else{
    var resp = {};
    resp.statusCode = 501;
    resp.message = "Conversation Id or Team Email is missing";
    res.status(501).send(resp);
  }
});

module.exports = router;
