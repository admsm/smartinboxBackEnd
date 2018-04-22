exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}

exports.followedConversationSchema = {
	conversationId : {
		type : String,
		required:[true,'conversationId is misssing']
	},
    userEmail : {
        type : String,
        required:[true,'userEmail is misssing']
    },
    teamEmail : { 
        type:String,
        required:[true, 'teamEmail is missing']
    },
    isActive : { 
        type:Number,
        default:1
    },
    createdOn : {
        type: Date, 
        default: Date.now 
    },
    modifiedOn : {
        type: Date, 
        default: Date.now 
    }
};

exports.followedConvoCollectionName = 'followedConversation';
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamMemberCollectionName = "teamMember";
