exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}


exports.templateSchema = {
		templateName : {
			type : String,
			required : [true,'messageId is misssing']
		},
        templateContent : {
            type : String,
            required:[true,'comment is misssing']
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

exports.teamConvoCollectionName = 'teamConversation';
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamMemberCollectionName = "teamMember";