var mongo = require('../helpers/mongo');
var config = require('../config');

exports.postComment = function(data,resultFunc){
	var dataToBeInserted = {};
	dataToBeInserted.comment = data.comment;
	dataToBeInserted.messageId = data.messageId;
	dataToBeInserted.teamEmail = data.teamEmail;
	dataToBeInserted.createdBy = data.teamMemberEmail;
	dataToBeInserted.isActive = 1;
	mongo.mongo_insert(config.commentMsgCollectionName,dataToBeInserted).then(function(value){
        	resultFunc(value);
        }).catch(function(err){
        	var errorMessage = {};
        	errorMessage.status = 400;
    		errorMessage.message = err.message;
        	resultFunc(errorMessage);
    });
}

exports.getComments = function(data,resultFunc){
	mongo.mongo_find(config.commentMsgCollectionName,{"teamEmail" : data.teamEmail,"messageId":data.messageId,'isActive':1}).then(function(value){
		resultFunc(value);
	});
}
