var express = require('express');
var router = express.Router();
var teams = require('../models/teammates');
var jwt = require('jwt-simple');
var config = require('../config');
var request = require('request');

function isAuthenticated(req,res,next){
        var key = '';
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            key = req.headers.authorization.split(' ')[1];
        } 
        else{
            res.status(401).json({
                message: "Unauthorized",
                statusCode:"401"
            });
            return;
        }
        
        requestToGetTeamMate(jwt.decode(key.toString(),config.appSecret),res,next);
}

function requestToGetTeamMate(email,res,next){
    
    teams.getDataById(email,function(statusCode,result){
        if(statusCode == 201){
            //console.log(result);
            res.locals = result;
            next();
        }
        else{
            res.status(401).json({
                message: "Unauthorized",
                statusCode:"401"
            });
            return;
        }
    });
}

/* GET home page. */
router.get('/', isAuthenticated,function(req, res, next) {
    // dont show the deactivated users

    if(req.query.teamEmail){
        var data = {};
        data.teamEmail = req.query.teamEmail;
        data.isActive = 1;
        data.isDeActivated = 0;
        
        teams.getData(data,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var resp = {};
        resp.statusCode = 200;
        resp.message = "Something went wrong. Please you are passing the teamEmail";
        res.statusCode = 200;
        res.send(resp);
    }
});

router.post('/internalInsert',function(req, res, next) {
    //console.log(req.body);
    if(req.body && req.body.teamMemberEmail && req.body.teamMemberName && req.body.userEmail){
        teams.insertData(req.body,function(statusCode, result) {
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var response = {};
        response.message = "Team Email, Team Member Email, Team Member Name or User Email is missing.";
        response.statusCode = "501";
        res.status(501).send(response);
    }
});


router.post('/teammates', isAuthenticated,function(req, res, next) {
    if(req.body && req.body.teamEmail && req.body.teamMemberEmail && req.body.teamMemberName && req.body.userEmail){
        teams.insertData(req.body,function(statusCode, result) {
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var response = {};
        response.message = "Team Email, Team Member Email, Team Member Name or User Email is missing.";
    }
});

router.get('/getDeactivatedUsers', isAuthenticated, function(req, res, next) {
    //console.log('fjkdjfkdf');
    if(req.query.teamEmail){
        var data = {};
        data.teamEmail = req.query.teamEmail;
        data.isDeActivated = 1;
        
        teams.getData(data,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var errorResponse = {};
        errorResponse.message = "Team Email is missing.";
        errorResponse.statusCode = 501;
        res.status(501).send(errorResponse);
    }
});


router.get('/teammates/:email', isAuthenticated, function(req, res, next) {
  	if(Object.keys(req.query).length === 0 && req.query.constructor === Object){
        teams.getDataById(req.params.email,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else if(req.query.teamEmail && req.params.email){
        
        var data = {};
        data.teamEmail = req.query.teamEmail;
        data.teamMemberEmail = req.params.email;
        
        teams.getUniqueTeam(data,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var resp = {};
        resp.statusCode = 200;
        resp.message = "Something went wrong. Please you are passing the teamEmail and teamMemberEmail";
        res.statusCode = 200;
        res.send(resp);
    }

    
});

router.put('/admin', isAuthenticated, function(req, res, next) {
   
    var flag = false;

    if(!req.body.teamEmail)
        res.status(501).send({"message":"Team Email is Missing." ,"statusCode":501});


    for(var key in res.locals){
        if(res.locals[key].isOwner == 1 && res.locals[key].teamEmail == req.body.teamEmail){
            flag = true;
        }
    }

    if(!flag){
        res.status(501).send({"message":"You does not mandatory have privilege." ,"statusCode":501});
    }

    if(req.body.newAdminEmail){
        
        var data = {};
        data.teamEmail = req.body.teamEmail;
        data.teamMemberEmail = req.body.newAdminEmail;
        
        var updateData = {};
        updateData.isOwner = 1;

        teams.updateDataById(data,updateData,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        result.message = "Admin Email is missing";
        result.statusCode = 501;
        res.statusCode = statusCode;
        res.status(501).send(result);
    }
});



router.put('/teammates/:email', isAuthenticated, function(req, res, next) {
   
    if(req.query.teamEmail && req.params.email){
        
        var data = {};
        data.teamEmail = req.query.teamEmail;
        data.teamMemberEmail = req.params.email;
        
        teams.updateDataById(data,req.body,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else if(req.body.teamEmail && req.params.email){
        var data = {};
        //data.teamEmail = req.body.teamEmail;
        data.teamMemberEmail = req.params.email;
        
        teams.updateDataById(data,req.body,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        result.message = "Team Email is missing";
        result.statusCode = 501;
        res.statusCode = statusCode;
        res.status(501).send(result);
    }
});

// this is for update teamEmail
router.put('/deactivate/:email', isAuthenticated, function(req, res, next) {
    var flag = false;

    if(!req.body.teamEmail)
        res.status(501).send({"message":"Team Email is Missing." ,"statusCode":501});


    for(var key in res.locals){
        if(res.locals[key].isOwner == 1 && res.locals[key].teamEmail == req.body.teamEmail){
            flag = true;
        }
    }

    if(!flag){
        res.status(501).send({"message":"You does not mandatory have privilege." ,"statusCode":501});
    }

    var data = {};
    data.teamEmail = req.body.teamEmail;
    data.teamMemberEmail = req.params.email;
    
    var updateData = {};
    updateData.isDeActivated = 1;

    teams.updateDataById(data,updateData,function(statusCode,result){
        res.statusCode = statusCode;
        res.send(result);
    });

});

// this is for update teamEmail
router.put('/teamemail/:email', isAuthenticated, function(req, res, next) {
    
    if(req.params.email && req.body.teamEmail){
    
        var data = {};
        data.teamMemberEmail = req.params.email;
        
        teams.updateTeamEmailByEmail(data,req,res,function(statusCode,result){
            res.statusCode = statusCode;
            res.send(result);
        });
    }
    else{
        var response = {};
        response.message = "Team Member Email or Team Email is missing";
        response.statusCode = 401;
        res.send(response);
    }
});

// this is for soft delete teamEmail
router.delete('/:email', isAuthenticated, function(req, res, next) {
   
    var flag = false;

    if(!req.body.teamEmail)
        res.status(501).send({"message":"Team Email is Missing." ,"statusCode":501});


    for(var key in res.locals){
        if(res.locals[key].isOwner == 1 && res.locals[key].teamEmail == req.body.teamEmail){
            flag = true;
        }
    }

    if(!flag){
        res.status(501).send({"message":"You does not mandatory have privilege." ,"statusCode":501});
    }
    
    var data = {};
    data.teamEmail = req.body.teamEmail;
    data.teamMemberEmail = req.params.email;
    
    var updateData = {};
    updateData.isActive = 0;

    teams.updateDataById(data,updateData,function(statusCode,result){
        res.statusCode = statusCode;
        res.send(result);
    });
    
});

module.exports = router;
