exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}


exports.signatureSchema = {
		signatureName : {
			type : String,
			required : [true,'signatureName is misssing']
		},
        signatureContent : {
            type : String,
            required:[true,'signatureContent is misssing']
        },
        signatureInfo : {
            type : String,
            required:[true,'signatureInfo is misssing']
        },
		teamMemberEmail : { 
			type:String,
			required:[true, 'teamMemberEmail is missing']
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

exports.signatureCollectionName = 'signatures';
exports.teamMemberCollectionName = "teamMember";
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';