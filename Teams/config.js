// schema for team collection.
exports.teamSchema = {
		teamName : { 
			type:String,
			required:[true, 'teamName is missing']
		},
		teamEmail : {
			type : String,
			required:[true,'teamEmail is misssing'],
			index : {'unique' : true}
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
            type : Number
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

// collection name
exports.collectionName = 'team';

exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB'; // this is ur db ip address.
exports.credentials = {
	'user' : '',
	'pass' : ''
}
