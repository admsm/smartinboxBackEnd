var mongo = require('../helpers/mongo');
var config = require('../config');
exports.getSignature = function(data,req,res,resultFunc){
	mongo.mongo_find(config.signatureCollectionName,data).then(function(value){
		res.status(201).send(value);
	});
}

exports.postSignature = function(data,resultFunc){
	var dataToBeInserted = {};
	dataToBeInserted.signatureName = data.name;
	dataToBeInserted.signatureContent = data.content;
	dataToBeInserted.signatureInfo = data.info;
	dataToBeInserted.teamMemberEmail = data.teamMemberEmail;
	dataToBeInserted.isActive = 1;
	mongo.mongo_insert(config.signatureCollectionName,dataToBeInserted).then(function(value){
			res.status(200).send(value);
			//console.log(value);
        }).catch(function(err){
        	var errorMessage = {};
        	errorMessage.status = 501;
    		errorMessage.message = err.message;
			res.status(501).send(errorMessage);
			//console.log(errorMessage);
    	});
}

exports.deleteSignature = function(data,resultFunc){
	var update = {'isActive':0};
	var conditions = {'_id' : data.id};
	
	mongo.mongo_update(conditions,update,config.signatureCollectionName).then(function(value){
		console.log(value);
	});
}

exports.updateSignature = function(data,update,resultFunc){
	mongo.mongo_update(data,update,config.signatureCollectionName).then(function(value){
		resultFunc(201,value);
	});
}