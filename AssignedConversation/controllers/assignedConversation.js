var mongo = require("../helpers/mongo");
var config = require("../config");


exports.assignConvo = function(data,resultFunc) {
	var conditions = {conversationId : data.conversationId,teamEmail : data.teamEmail};
	var update = {assignTo : data.teamMemberEmail};

	mongo.mongo_update(conditions,update,config.teamConvoCollectionName).then(function(value){
		resultFunc(value);
	});	
}


exports.getConvo = function(data,resultFunc) {
	var limit = 1000;
	var skip = 0;
	if(data.limit){
		limit = data.limit;
	}
	
	if(data.skip){
		skip = data.skip;
	}
	
	mongo.mongo_find(config.teamConvoCollectionName,{"assignTo":data.teamMemberEmail,"teamEmail" : data.teamEmail, "isArcheive": false, "isActive": true},{'lastModifiedDateTime':-1},limit,skip).then(function(value){
		resultFunc(value);
	}).catch(function(err){
		resultFunc(err);
	});

}
