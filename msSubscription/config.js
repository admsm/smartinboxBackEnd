exports.subscriptionConfiguration = {
  changeType: 'Created,Updated',
//  notificationUrl: 'http://localhost:3002/listen',
  notificationUrl: 'https://7e3a74d8.ngrok.io/listen',
  resource:'me/messages',
  //resource: 'me/mailFolders(\'Inbox\')/messages',
  clientState: 'cLIENTsTATEfORvALIDATION'
};

exports.teamMemberCollectionName = 'teamMember';
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.credentials = {
        'user' : '',
        'pass' : ''
};

// schema for conversation collection.
exports.conversationSchema = {
    conversationId : { 
        type:String,
        required:[true, 'conversationId is missing'],
        unique:true
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
    senderEmail : {
        type : String,
        required:[true,'senderEmail is missing']
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

// collection name
exports.collectionName = 'conversation';
exports.teamConvoCollectionName = 'teamConversation';
exports.microsoftMailFolderUrl = "https://graph.microsoft.com/v1.0/me/mailFolders/";
exports.conversationUrl = "http://localhost:3005";
exports.rulesUrl = "http://localhost:3017";
exports.refreshTokenUrl = "http://localhost:3001";
