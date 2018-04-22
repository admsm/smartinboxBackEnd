var database = require("../config");
//var app = require("../app");
//var mongo_client = exports.mongo_client = app.mongo_client;
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
//app.remoteConnectionString = "mongodb://teammate:WbmubhcPt9hA2UNQaD8Q73CTl7YZCsg3HmZAUNbo3x0QC8o0c0TevvWzIMBM2813lHy9EehQVE9glVzZP49JGw==@teammate.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

//var mongo_client = exports.mongo_client = mongoose_client.createConnection(app.remoteConnectionString || database.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(database.mongoConfig);

// var database = require('../config');
// var mongoose_client = exports.mongoose_client = require('mongoose');
// mongoose_client.Promise = global.Promise;
// var mongo_client = exports.mongo_client = mongoose_client.createConnection(database.mongoConfig,database.credentials);


// exports.mongo_insert = function (collection, data) {
//     return new Promise(function (resolve, reject) {
//         var Schema = mongoose_client.Schema;
//         var tracking_events_mongo = new Schema(database.conversationSchema);
//         tracking_events_mongo.index({teamEmail:1,teamMemberEmail:1} , {unique:true}); // setting the composite unique key
        
//         var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);

// 	    var dataFromMongo = new ModelMongo(data);
//        	var error = dataFromMongo.validateSync();
        
// 	   dataFromMongo.save(function (err, data) {
//             if(err){
//                 reject(err);
//             }else{
//                 resolve(data);
//             }
//         });
//     });
// };

exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(database.teamMemberSchema);
        tracking_events_mongo.index({teamEmail:1,teamMemberEmail:1} , {unique:true}); // setting the composite unique key
        
        var ModelMongo = mongo_client.model(collection, tracking_events_mongo, collection);

	    var dataFromMongo = new ModelMongo(data);
       	var error = dataFromMongo.validateSync();
        
	   dataFromMongo.save(function (err, data) {
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    });
};



exports.mongo_find = function (collection,findParams = {}, selectParams = {}) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	    var tracking_events_mongo = new Schema(database.teamMemberSchema, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(findParams,selectParams,{ sort : {_id:-1}}, function (err, data) {
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
        	var tracking_events_mongo = new Schema(database.teamMemberSchema, {strict : false});

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

exports.mongo_update_many = function (collection, data, collectionSchema) {
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
        var Bulk = ModelMongo.collection.initializeUnorderedBulkOp();

        let bulkInsertCollection = function(arr, callback){
            
            for( var key in arr){
                if(collectionSchema.teamEmail){
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

exports.mongo_update = function (conditions,update,collection){
	return new Promise(function (resolve, reject) {

        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(database.teamMemberSchema, {strict : false});

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
