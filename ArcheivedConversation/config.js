exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}

exports.teamConversationSchema = {
	conversationId : { 
		type:String,
		required:[true, 'conversationId is missing']
	},
	teamEmail : { 
		type:String,
		required:[true, 'teamEmail is missing']
	},
	isRead : {
		type : Boolean,
		default : false
		//required:[true, 'type is missing']
	},
    isArcheive : {
		type : Boolean,
		default : false
		//required:[true, 'isArcheive is missing']
	},
    isActive : {
        type : Boolean,
        default : true
        //required:[true, 'isActive is missing']
    },
    assignTo : {
        type: String, 
        default: null
        //required:[true, 'assignTo is missing'] 
    }
};

exports.teamConvoCollectionName = 'teamConversation';
exports.teamMemberCollectionName = "teamMember";
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';