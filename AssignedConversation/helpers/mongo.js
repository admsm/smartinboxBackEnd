var config = require('../config');
var mongoose_client = exports.mongoose_client = require('mongoose');

//var app = require("../app");
mongoose_client.Promise = global.Promise;

//app.remoteConnectionString = "mongodb://teams:JKTYBobBY2IcnUBEBKonoyBEsgSf5qpq0ARqKGu0Pq2qq9voFA0RvSp5DHFDSJ8dTB4RsL1VjVenQS5BsuYWsw==@teams.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
//var mongo_client = exports.mongo_client = mongoose_client.createConnection(app.remoteConnectionString || config.mongoConfig);
var mongo_client = exports.mongo_client = mongoose_client.createConnection(config.mongoConfig);



exports.mongo_find = function (collection,filter = {},sort = {_id:-1},limit = 1000,skip = 0) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema(config.teamConversationSchema, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(filter,{},{ sort : sort , limit : limit,skip:skip}, function (err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        })
    });
}

exports.mongo_find_new = function (collection,filter = {}) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema({}, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find(filter,{},{}, function (err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        })
    });
}


exports.mongo_update = function (conditions,update,collection){
	 return new Promise(function (resolve, reject) {

        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema(config.teamConversationSchema, {strict : false});

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
