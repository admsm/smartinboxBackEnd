var mongo = require('../helpers/mongo');

exports.getTemplate = function(data,resultFunc){
	mongo.mongo_find("templates",{"_id":data.id,'isActive':1}).then(function(value){
		resultFunc(201,value);
	});
}

exports.getTemplateByEmail = function(data,resultFunc){
	mongo.mongo_find("templates",{"teamEmail":data.email,'isActive':1}).then(function(value){
		resultFunc(201,value);
	});
}

exports.postTemplate = function(data,resultFunc){
	var dataToBeInserted = {};
	dataToBeInserted.templateName = data.templateName;
	dataToBeInserted.templateContent = data.templateContent;
	dataToBeInserted.teamEmail = data.teamEmail;
	
	dataToBeInserted.isActive = 1;
	mongo.mongo_insert("templates",dataToBeInserted).then(function(value){
			resultFunc(201,value);
			//console.log(value);
        }).catch(function(err){
        	var errorMessage = {};
        	errorMessage.status = 400;
			errorMessage.message = err.message;
			resultFunc(501,errorMessage);
        	//console.log(errorMessage);
    	});
}

exports.deleteTemplate = function(data,resultFunc){
	var update = {'isActive':0};
	var conditions = {'_id' : data.id};
	
	mongo.mongo_update(conditions,update,"templates").then(function(value){
		console.log(value);
	});
}

exports.updateTemplate = function(data,resultFunc){
	var update = {'templateContent':data.templateContent};
	var conditions = {'_id' : data.id};
	
	mongo.mongo_update(conditions,update,"templates").then(function(value){
		console.log(value);
	});
}