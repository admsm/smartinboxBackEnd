var mongo = require('../helpers/mongo');
var config = require('../config');

exports.archeiveConvo = function(data,resultFunc){

	var conditions = {conversationId : data.conversationId,teamEmail : data.teamEmail, "isActive": true};
	var update = {isArcheive : true};

	mongo.mongo_update(conditions,update,config.teamConvoCollectionName).then(function(value){
		resultFunc(value);
	});	
}

exports.getArcheiveConvoByTeamMember = function(data,resultFunc){
	mongo.mongo_find(config.teamConvoCollectionName,{"teamEmail":data.teamEmail,"isArcheive":true, "isActive": true}).then(function(value){
		resultFunc(value);
	});
}

exports.unArchieveConvo = function(data,resultFunc){

	var conditions = {conversationId : data.conversationId,teamEmail : data.teamEmail};
	var update = {isArcheive : false};
	mongo.mongo_update(conditions,update,config.teamConvoCollectionName).then(function(value){
		resultFunc(value);
	});	
}
