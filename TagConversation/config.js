exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}

exports.tagConversationSchema = {
	conversationId : {
		type : String,
		required:[true,'conversationId is misssing']
	},
    tagName : {
        type : String,
        required:[true,'tagName is misssing']
    },
	teamEmail : { 
		type:String,
		required:[true, 'teamEmail is missing']
	},
    createdBy : {
        type : String,
        required:[true,'createdBy is misssing']
    },
    modifiedBy : {
        type : String
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

exports.tagCollectionName = 'tagConversation';
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamMemberCollectionName = "teamMember";
