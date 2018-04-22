exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}

exports.conditionSchema = {
	conditionType : { 
		type:String,
		required:[true, 'conditionType is missing']
	},
	teamEmail : { 
		type:String,
		required:[true, 'teamEmail is missing']
	},
	conditionKeyword : { 
		type:String,
		required:[true, 'conditionKeyword is missing']
	},
	isActive : {
		type : Boolean,
		default : true
	}
};

exports.rulesSchema = {
	conditionType : { 
		type:String,
		required:[true, 'conditionRelationship is missing']
	},
	teamEmail : { 
		type:String,
		required:[true, 'teamEmail is missing']
	},
	teamMemberEmail : { 
		type:String,
		required:[true, 'teamEmail is missing']
	},
	event : { 
		type:Number,
		required:[true, 'event is missing']
	},
	conditions : { 
		type:Object,
		required:[true, 'conditions is missing']
	},
	result : { 
		type:Object,
		required:[true, 'result is missing']
	},
	isActive : {
		type : Boolean,
		default : true
	}
};

exports.conditionCollection = 'rulesCondition';
exports.rulesCollection = 'rules';

exports.assignConvUrl = "http://localhost:3006";
exports.tagUrl = "http://localhost:3008";
exports.archievConvUrl = "http://localhost:3009";
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamMemberCollectionName = "teamMember";
