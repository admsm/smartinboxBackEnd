var config = require('../config');
var mongoose_client = exports.mongoose_client = require('mongoose');
//var app = require("../app");
mongoose_client.Promise = global.Promise;
//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

//var mongo_client = exports.mongo_client = mongoose_client.createConnection(app.remoteConnectionString || config.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);


exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(config.tagConversationSchema);

        tracking_events_mongo.index({teamEmail:1,conversationId:1,tagName:1} , {unique:true});

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

exports.mongo_update = function (conditions,update,collection){
	 return new Promise(function (resolve, reject) {

                var Schema = mongoose_client.Schema;
                var tracking_events_mongo = new Schema(config.tagConversationSchema, {strict : false});

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
