var config = require('../config');
var assert = require('assert');
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig,config.credentials);


exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(config.templateSchema);
        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);

	    var dataFromMongo = new ModelMongo(data);
       	//var error = dataFromMongo.validateSync();

	    dataFromMongo.save(function (err, data) {
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    });
};

exports.mongo_insert_many = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema({
            bodyPreview : { 
                type:String,
                required:[true, 'bodyPreview is missing']
            },
            senderEmail : {
                type : String,
                required:[true,'senderEmail is misssing']
            },
            senderName : {
                type : String,
                required:[true,'senderName is misssing']
            },
            subject : {
                type : String,
                required:[true,'subject is misssing']
            },
            bodyPreview : {
                type : String,
                required:[true,'bodyPreview is misssing']
            },
            conversationId : {
                type : String,
                required:[true,'conversationId is misssing']
            },
            conversationIndex : {
                type : String,
                required:[true,'conversationIndex is misssing']
            },
            internetMessageId : {
                type : String,
                required:[false,'internetMessageId is misssing']
            },
            isRead : {
                type : String,
                default:false
            },
            isDraft : {
                type : String,
                default:false
            },
            flagStatus : {
                type : String,
                default:'notFlagged'
            },
            messageId : {
                type : Object,
                required:[true,'messageId is misssing']
            },
            sentDateTime : {
                type : Date,
                required:[true,'sentDateTime is misssing']
            },
            receivedDateTime : {
                type : Date,
                required:[true,'receivedDateTime is misssing']
            },
            lastModifiedDateTime:{
                type : Date,
                required:[true,'lastModifiedDateTime is misssing']
            },
            hasAttachments : {
                type : Boolean,
                required:[true,'hasAttachments is misssing'],
                default:false
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
        });
        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        let bulkInsertCollection = function(arr, callback){
            var Bulk = ModelMongo.collection.initializeUnorderedBulkOp();
            arr.forEach(function (entry) {
                Bulk.insert(entry);
            });
            Bulk.execute(function (err, data) {
                callback(err, data);
            });
        };

        bulkInsertCollection(data, function (err, data) {
            if(err)
                console.log(err);
            //console.log(data);
        });
    });
};


exports.mongo_find = function (collection,filter = {}) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema({
        }, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(filter,{},{ sort : {_id:-1}}, function (err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        })
    });
}

exports.mongo_find_by_id = function (id,collection){
	return new Promise(function (resolve, reject) {
		
        	var Schema = mongoose_client.Schema;
        	var tracking_events_mongo = new Schema({
        	}, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.findById(id,function (err, data) {
            if(err){
                reject(err);
            }
	    //console.log(data);
            resolve(data);
        })
    });

}

exports.mongo_update = function (conditions,update,collection){
	 return new Promise(function (resolve, reject) {

                var Schema = mongoose_client.Schema;
                var tracking_events_mongo = new Schema({
                }, {strict : false});

        	let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
		
		//var conditions = {_id : id };
		//var update = {'email' : 'pqrst@gmail.com'};
		var options = {'multi' : 'true'};		

        	TrackingEventsMongo.update(conditions,update,options,function (err, data) {
            		if(err){
                		reject(err);
            		}      
	  			resolve(data);
            	})
         });
            
}
