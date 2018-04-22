var config = require('../config');
//var app = require("../app");
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
//app.remoteConnectionString = "mongodb://teammate:WbmubhcPt9hA2UNQaD8Q73CTl7YZCsg3HmZAUNbo3x0QC8o0c0TevvWzIMBM2813lHy9EehQVE9glVzZP49JGw==@teammate.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

//var mongo_client = exports.mongo_client = mongoose_client.createConnection(app.remoteConnectionString || config.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);


exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema({
    		bodyPreview : { 
    			type:String,
    			required:[true, 'bodyPreview is missing']
    		},
    		senderEmail : {
    			type : String,
    			required:[true,'senderEmail is missing']
    		},
            senderName : {
                type : String,
                required:[true,'senderName is missing']
            },
            subject : {
                type : String,
                required:[true,'subject is missing']
            },
            conversationId : {
                type : String,
                required:[true,'conversationId is missing']
            },
            conversationIndex : {
                type : String,
                required:[true,'conversationIndex is missing']
            },
            internetMessageId : {
                type : String,
                required:[false,'internetMessageId is missing']
            },
            isRead : {
                type : String,
                default:false
            },
            isArcheive : {
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
                required:[true,'messageId is missing']
            },
            sentDateTime : {
                type : Date,
                required:[true,'sentDateTime is missing']
            },
            receivedDateTime : {
                type : Date,
                required:[true,'receivedDateTime is missing']
            },
            teamEmail : {
                type : Date,
                required:[true,'teamEmail is missing']
            },
            lastModifiedDateTime:{
                type : Date,
                required:[true,'lastModifiedDateTime is missing']
            },
            hasAttachments : {
                type : Boolean,
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

exports.mongo_update = function (conditions,update,schema,collection){
	return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(schema, {strict : false});

    	let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
	  
		var options = {'upsert' : 'true'};		

    	TrackingEventsMongo.update(conditions,update,options,function (err, data) {
        		
                if(err){
            		reject(err);
        		}

	  			resolve(data);
        });
    });
}
