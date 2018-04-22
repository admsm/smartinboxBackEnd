var config = require('../config');
//var assert = require('assert');
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
//remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

//var mongo_client = exports.mongo_client = mongoose_client.createConnection(remoteConnectionString || config.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);


exports.mongo_insert = function (collection, data,schema) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(schema);

        if(schema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

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

        if(schema.teamEmail){
            tracking_events_mongo.index({teamEmail:1,conversationId:1} , {unique:true});
        }
        else{
            tracking_events_mongo.index({conversationId:1} , {unique:true});
        }

    	let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
	  
		var options = {'upsert' : 'true'};		

    	TrackingEventsMongo.update(conditions,update,{},function (err, data) {
        		console.log(data,err);
                if(err){
            		reject(err);
        		}

	  			resolve(data);
        });
    });
}
