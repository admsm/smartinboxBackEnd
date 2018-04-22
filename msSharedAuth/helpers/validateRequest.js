var mongo = require('./mongo');
var jwt = require('jwt-simple');
var config = require('../config');


exports.authorizeUser = function(req,res,next){

	var key = '';
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		var key = req.headers.authorization.split(' ')[1];
	}
	else {
		res.status(401).json({
			message: "Missing Authorization header",
			code:"401"
		});
		return;
	}

	var decodedString = jwt.decode(key,config.appSecret);
	//console.log(decodedString);
	if(decodedString){
		//sends to check whether already a user.
		var conditionParam = {};
		conditionParam.teamMemberEmail = decodedString;

		if(req.body.teamEmail){
			conditionParam.teamEmail = req.body.teamEmail;
		}

		conditionParam.isActive = 1;

		mongo.mongo_find(config.teamMemberCollectionName,conditionParam).then(function(value){
			//console.log(value[0].isOwner);
			if(value.length == 0){
				res.status(401).json({
					message: "Authentication Error.",
					code:"501"
				});
			}
			else if(value.length > 0){
				res.locals.loggedInEmail = decodedString;
				//value = JSON.parse(value);
				//JSON.stringify();
				console.log(value[0].isOwner);
				res.locals.isOwner = value[0].isOwner; 
				next();
			}
			
		}).catch(function(err){ 
			var error = {};
			error.statusCode = 401;
			error.message = err.message;
			res.status(401).json(error);
		});
	}
	else{
		res.status(401).json({
			message: "Missing Authorization header",
			code:"401"
		});
	}
}


function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

