
// schema for conversation collection.
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
        default : false,
        //required:[true, 'type is missing']
    },
    isArcheive : {
        type : Boolean,
        default : false,
        //required:[true, 'isArcheive is missing']
    },
    isActive : {
        type : Boolean,
        default : true,
        //required:[true, 'isActive is missing']
    },
    assignTo : {
        type: String, 
        default: null,
        //required:[true, 'assignTo is missing'] 
    },
    senderName : { 
        type:String,
        required:[true, 'senderName is missing']
    },
    sentDateTime : { 
        type:String,
        required:[true, 'sentDateTime is missing']
    },
    subject : {
        type : String,
        required:[true,'subject is missing']
    },
    bodyPreview : {
        type : String,
        required:[true,'bodyPreview is missing']
    },
    hasAttachments : {
        type : Number,
        default : 0
    },
    lastModifiedDateTime : {
        type: Date, 
        default: Date.now 
    },
    receivedDateTime : {
        type: Date, 
        default: Date.now 
    }
};

// schema for mailFolder collection.
exports.mailFolderSchema = {
	displayName : { 
        type:String
    },
	parentFolderId : {
        type : String
    },
    childFolderCount : {
        type : Number
    },
    unreadItemCount : {
        type : Number
    },
    totalItemCount : {
        type : Number
    },
    id : {
        type : String,
        //unique : true
    },
    teamEmail : { 
        type:String,
        required:[true, 'teamEmail is missing']
    },
    isInboxFolder : { 
        type:Number,
        default : 0
        //required:[true, 'teamEmail is missing']
    }
};

// collection name
exports.collectionName = 'conversation';
exports.teamConvoCollectionName = 'teamConversation';
exports.mailFolderCollectionName = 'mailFolder';


exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
}