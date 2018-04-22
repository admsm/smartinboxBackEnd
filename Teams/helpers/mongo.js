var config = require("../config");
//var app = require("../app");
//var mongo_client = exports.mongo_client = app.mongo_client;
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
//console.log(app.remoteConnectionString);
//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);


exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(config.teamSchema);
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

exports.mongo_find = function (collection,findParam = {},selectParam = {}) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema(config.teamSchema, {strict : false,versionKey : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(findParam,selectParam,{ sort : {_id:-1}}, function (err, data) {
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
    	var tracking_events_mongo = new Schema(config.teamSchema, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.findById(id,function (err, data) {
            if(err){
                reject(err);
            }
	        resolve(data);
        })
    });

}

exports.mongo_update = function (condition,update,collection){
    return new Promise(function (resolve, reject) {

        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(config.teamSchema, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
    	
    	var options = {'multi' : 'true'};		

    	TrackingEventsMongo.update(condition,update,options,function (err, data) {
    		if(err){
        		reject(err);
    		}

    		resolve(data);
        });
    });
            
}
