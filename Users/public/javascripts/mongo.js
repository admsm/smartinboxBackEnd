var database = require('../config/database');
var assert = require('assert');
var mongoose_client = exports.mongoose_client = require('mongoose');
mongoose_client.Promise = global.Promise;
var mongo_client = exports.mongo_client = mongoose_client.createConnection(database.mongoConfig,database.credentials);


exports.mongo_insert = function (collection, data) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
        var tracking_events_mongo = new Schema({
		email : { 
			type:String,
			required:[true, 'Email Id is missing']
		}
	});
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

exports.mongo_find = function (collection) {
    return new Promise(function (resolve, reject) {
        var Schema = mongoose_client.Schema;
	var tracking_events_mongo = new Schema({
        }, {strict : false});

        let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);

        TrackingEventsMongo.find({},{},{ sort : {_id:-1}}, function (err, data) {
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

exports.mongo_update = function (id,update,collection){
	 return new Promise(function (resolve, reject) {

                var Schema = mongoose_client.Schema;
                var tracking_events_mongo = new Schema({
                }, {strict : false});

        	let TrackingEventsMongo = mongo_client.model(collection, tracking_events_mongo, collection);
		
		var conditions = {_id : id };
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
