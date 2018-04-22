exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}

exports.commentMsgSchema = {
    messageId : {
		type : String,
		required:[true,'messageId is misssing']
	},
    comment : {
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
    createdBy:{
        type:String,
    }

};

exports.commentMsgCollectionName = 'commentCol';




