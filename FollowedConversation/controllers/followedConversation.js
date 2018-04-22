var mongo = require('../helpers/mongo');
var config = require('../config');

exports.getFollowedConvo = function(data,resultFunc){
	
	mongo.mongo_find("followedConversation",{"teamEmail":data.teamEmail,"userEmail":data.teamMemberEmail,'isActive':1}).then(function(value){
		resultFunc(value);
	});

}

exports.followConvo = function(data,resultFunc){
	var dataToBeInserted = {};
	dataToBeInserted.conversationId = data.conversationId;
	dataToBeInserted.userEmail = data.teamMemberEmail;
	dataToBeInserted.teamEmail = data.teamEmail;
	dataToBeInserted.isActive = 1;

	mongo.mongo_insert("followedConversation",dataToBeInserted).then(function(value){
                resultFunc(value);
        }).catch(function(err){
        	var errorMessage = {};
        	errorMessage.status = 400;
    		errorMessage.message = err.message;
        	resultFunc(errorMessage);
    });
}

exports.unFollowConvo = function(data,resultFunc){
	var update = {'isActive':0};
	var conditions = {'conversationId' : data.conversationId,'userEmail':data.teamMemberEmail,'teamEmail':data.teamEmail};
	//console.log(update);
	mongo.mongo_update(conditions,update,"followedConversation").then(function(value){
		resultFunc(value);
		//console.log(value);
	});
}