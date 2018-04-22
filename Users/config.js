// schema for team collection.
exports.teamMemberSchema = {
		teamMemberName : { 
			type:String,
			required:[true, 'teamMemberName is missing']
		},
		teamMemberEmail : {
			type : String,
			required:[true,'teamEmail is missing']
        },
        isOwner : {
            type : Number,
            default : 0
        },
        teamEmail : {
            type : String,
            default : null
        },
        isDeActivated : {
            type : Number,
            default : 0
        },
        createdBy : {
            type: String, 
            default: null 
        },
        modifiedBy : {
            type: String, 
            default: null 
        },
        isActive : {
            type : Number,
            default : 1
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



exports.conversationSchema = {
    conversationId : { 
        type:String,
        required:[true, 'conversationId is missing']
    },
    subject : {
        type : String,
        required:[true,'subject is missing']
    },
    senderEmail : {
        type : String,
        required:[true,'senderEmail is missing']
    },
    createdBy : {
        type: String, 
        default: null 
    },
    modifiedBy : {
        type: String, 
        default: null 
    },
    createdDateTime : {
        type: Date, 
        default: Date.now 
    }
};
// collection name
exports.collectionName = 'teamMember';

exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB'; // this is ur db ip address.
exports.credentials = {
	'user' : '',
	'pass' : ''
}
exports.teamMateUrl = "http://or1010050154244.corp.adobe.com:3004";
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';