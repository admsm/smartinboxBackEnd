var mongo = require("../helpers/mongo");
var config = require("../config");

exports.insertData = function(data,resultFunc)
{
	data.createdBy = data.userEmail;
	data.modifiedBy = data.userEmail;
	data.isActive = 1;

	mongo.mongo_insert(config.collectionName,data).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){ 
		//console.log(err);
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}

exports.getData = function(resultFunc){
	mongo.mongo_find(config.collectionName).then(function(value){
		resultFunc(200,value);
	});
}

exports.getDataById = function(email,resultFunc){
	var findParam = {};
	findParam.teamEmail = email;
	findParam.isActive = 1;

	var selectParam = {};
	selectParam.teamEmail = 1;
	selectParam.teamName = 1;
	selectParam._id = 0;
	selectParam.createdBy = 1;

	mongo.mongo_find(config.collectionName,findParam,selectParam).then(function(value){
		
		if(value.length == 0){
			var resp = {};
			resp.statusCode = 200,
			resp.message = "No Team found with this Email id !!";
			resultFunc(200,resp);
		}
		else if(value.length > 0){
			resultFunc(200,value[0]);	
		}
		
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}

exports.updateDataById = function(email,updateData,resultFunc){
	var condition = {};
	condition.teamEmail = email;
	condition.isActive = 1;
	
	mongo.mongo_update(condition,updateData,config.collectionName).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}
