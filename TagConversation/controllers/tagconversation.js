var mongo = require('../helpers/mongo');
var config = require("../config");

exports.tagConvo = function(data,resultFunc){
	var dataToBeInserted = {};
	dataToBeInserted.tagName = data.tagName;
	dataToBeInserted.conversationId = data.conversationId;
	dataToBeInserted.teamEmail = data.teamEmail;
	dataToBeInserted.createdBy = data.teamMemberEmail;
	dataToBeInserted.modifiedBy = data.teamMemberEmail;
	dataToBeInserted.isActive = 1;
	mongo.mongo_insert(config.tagCollectionName,dataToBeInserted).then(function(value){
                resultFunc(value);
		}).catch(function(err){
        	var errorMessage = {};
        	errorMessage.status = 400;
    		errorMessage.message = err.message;
        	resultFunc(errorMessage);
    });
}

exports.unTagConvo = function(data,resultFunc){
	var update = {'isActive':0};
	var conditions = {'conversationId' : data.conversationId,'tagName':data.tagName,'teamEmail':data.teamEmail};
	//console.log(update);
	mongo.mongo_update(conditions,update,config.tagCollectionName).then(function(value){
		resultFunc(value);
	});
}

exports.getTagsForConvo = function(data,resultFunc){
	mongo.mongo_find(config.tagCollectionName,{"conversationId":data.conversationId,"teamEmail":data.teamEmail,'isActive':1}).then(function(value){
		resultFunc(value);
	});
}

exports.updateTag = function(data,resultFunc){
	var update = {'tagName':data.newTagName};
	var conditions = {'conversationId' : data.conversationId,"teamEmail":data.teamEmail,'tagName':data.oldTagName};
	
	mongo.mongo_update(conditions,update,config.tagCollectionName).then(function(value){
		resultFunc(value);
	});
}