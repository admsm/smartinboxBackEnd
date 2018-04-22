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
	//console.log(key);
	var decodedString = jwt.decode(key,config.appSecret);
	//console.log(decodedString);
	if(decodedString){
		//sends to check whether already a user.
		var conditionParam = {};
		conditionParam.teamMemberEmail = decodedString;
		conditionParam.isActive = 1;
		//console.log(conditionParam);
		mongo.mongo_find_new(config.teamMemberCollectionName,conditionParam).then(function(value){
			//console.log(value);
			if(value.length == 0){
				res.status(401).json({
					message: "Missing Authorization header",
					code:"401"
				});
			}
			else if(value.length > 0){
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

