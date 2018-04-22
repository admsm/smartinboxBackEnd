var express = require('express');
var router = express.Router();
var teams = require('../models/teams');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send(process.env);
    //res.render('index', { title: 'Express' });
});

// getting all the teams.
router.get('/teams', function(req, res, next) {
  teams.getData(function(statusCode,result){
		res.statusCode = statusCode;
		res.send(result);
	});
});

router.post('/teams', function(req, res, next) {
    teams.insertData(req.body,function(statusCode, result) {
        res.statusCode = statusCode;
        res.send(result);
    });
});

router.get('/teams/:email', function(req, res, next) {
  	teams.getDataById(req.params.email,function(statusCode,result){
        res.statusCode = statusCode;
        res.send(result);
    });
});

router.put('/teams/:email', function(req, res, next) {
	teams.updateDataById(req.params.email,req.body,function(statusCode,result){
        res.statusCode = statusCode;
        res.send(result);
    });
});


module.exports = router;
