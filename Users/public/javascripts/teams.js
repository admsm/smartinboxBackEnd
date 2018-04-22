var mongo = require("./mongo");
var config = require("../config/bootstrap");

exports.insertData = function(data,resultFunc)
{
	mongo.mongo_insert(config.collection,data).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){console.log(err.message); });//console.log(err)});

}

exports.getData = function(resultFunc){
	mongo.mongo_find(config.collection).then(function(value){
		resultFunc(200,value);
	});
}

exports.getDataById = function(id,resultFunc){
	mongo.mongo_find_by_id(id,config.collection).then(function(value){
                resultFunc(200,value);
        });
}

exports.updateDataById = function(id,updateData,resultFunc){
	mongo.mongo_update(id,updateData,config.collection).then(function(value){
		resultFunc(200,value);
	});
}
