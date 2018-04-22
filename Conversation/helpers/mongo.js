var config = require('../config');
var mongoose_client = exports.mongoose_client = require('mongoose');
//var app = require("../app");

mongoose_client.Promise = global.Promise;
//var redis = require("./redis");
//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
//app.remoteConnectionString = "mongodb://teammate:WbmubhcPt9hA2UNQaD8Q73CTl7YZCsg3HmZAUNbo3x0QC8o0c0TevvWzIMBM2813lHy9EehQVE9glVzZP49JGw==@teammate.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

//var mongo_client = exports.mongo_client = mongoose_client.createConnection(app.remoteConnectionString || config.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);


exports.mongo_insert = function (collection, data,collectionSchema) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(collectionSchema);
        
        if(collectionSchema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);

	    var dataFromMongo = new ModelMongo(data);
       	//var error = dataFromMongo.validateSync();

	    dataFromMongo.save(function (err, data) {
            console.log(data);
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    });
};

exports.mongo_insert_many = function (collection, data, collectionSchema,email = "") {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(collectionSchema);
        if(collectionSchema.parentFolderId){
            // do nothing.
            //tracking_events_mongo.index({teamEmail:1,id:1} , {unique:true});
        }
        else if(collectionSchema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);



        let bulkInsertCollection = function(arr, callback){
            var Bulk = ModelMongo.collection.initializeUnorderedBulkOp();
            for( var key in arr){
                if(arr[key]['@odata.type'] && collectionSchema.parentFolderId){
                    //console.log(arr[key]['@odata.type']);
                    delete arr[key]['@odata.type'];
                }

                if(email != "" && collectionSchema.parentFolderId){
                    arr[key]['teamEmail'] = email;
                    if(!arr[key]["isInboxFolder"]){
                        arr[key]['isInboxFolder'] = 0;
                    }
                }

                Bulk.insert((arr[key]));
            }
            
            Bulk.execute(function (err, data) {
                callback(err, data);
            });
        };
        //console.log(data);
        bulkInsertCollection(data, function (err, data) {
            if(err)
                reject(err);
            else
                resolve(data);
        });
    });
};

exports.mongo_update_many = function (collection, data, collectionSchema,email = "") {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(collectionSchema);
        if(collectionSchema.parentFolderId){
            // do nothing.
            tracking_events_mongo.index({teamEmail:1,id:1} , {unique:true});
        }
        else if(collectionSchema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);
        var Bulk = ModelMongo.collection.initializeUnorderedBulkOp();

        let bulkInsertCollection = function(arr, callback){
            
            for( var key in arr){
                
                if(collectionSchema.parentFolderId && email != ""){
                    Bulk.find({"id" : arr[key].id,"teamEmail":email }).update({$set : {"isInboxFolder" : 1}});
                }
                else if(collectionSchema.teamEmail){
                    Bulk.find({"conversationId" : arr[key].conversationId,"teamEmail":arr[key].teamEmail }).upsert().update({$set : arr[key]});
                }
                else{
                    
                    var setOnInsert = {};
                    setOnInsert.subject = arr[key].subject;
                    setOnInsert.createdDateTime = arr[key].createdDateTime;
                    setOnInsert.createdBy = arr[key].createdBy;

                    delete arr[key].subject;
                    delete arr[key].createdDateTime;
                    delete arr[key].createdBy;
                    //console.log('sjaksjaks');
                    Bulk.find({"conversationId" : key}).upsert().update({$set : arr[key],$setOnInsert:setOnInsert});
                }
            }
            
            Bulk.execute(function (err, data) {
                
                if(err){
                    //console.log(err.writeErrors[0].errmsg);
                }
                
                callback(err, data);
            });
        };

        bulkInsertCollection(data, function (err, data) {
            if(err)
                reject(err);
            else
                resolve(data);
        });
    });
};

exports.mongo_find = function (collection,filter = {},sort = {_id:-1},limit = 1000,skip = 0) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema({
        }, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(filter,{},{ sort : sort , limit : limit,skip:skip}, function (err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        })
    });
}

// did just to speed up the find
exports.mongo_find_mailFolder = function (collection,filter = {}) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema({
        }, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(filter,{},{}, function (err, data) {
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

exports.mongo_update = function (conditions,update,collection,collectionSchema){
	 return new Promise(function (resolve, reject) {

        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(collectionSchema, {strict : false});

        if(collectionSchema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

    	let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
	
	    var options = {'multi' : 'true'};		

    	TrackingEventsMongo.update(conditions,update,options,function (err, data) {
    		if(err){
        		reject(err);
    		}      
  			resolve(data);
        })
    });
            
}
