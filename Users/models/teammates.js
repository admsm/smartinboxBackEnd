var mongo = require("../helpers/mongo");
var config = require("../config");

exports.insertData = function(data,resultFunc)
{

	// var data = [];
	// data[0] = {};
	// data[0].subject =  'RE: Medium INC000002952977 - " REQ : IP bounce request " Assigned to IM-IT-Network Ops';
    // data[0].conversationId = 'AAQkADk1Y2Y4YzQxLTg1YjEtNGNkNC1hY2NiLTVjMWIxODM5N2I5MgAQAF_VAeYQfVBGuxor0M1bJmk=';
    // data[0].senderEmail = 'arunsin@adobe.com';
    // data[0].createdDateTime = '2018-03-20T12:02:10Z';
    // data[0].createdBy = 'arunsin@adobe.com';
    // data[0].modifiedBy = 'arunsin@adobe.com';

    // //insertToMongo(config.collectionName,data,config.conversationSchema);

    // mongo.mongo_update_many(config.collectionName,data,config.conversationSchema).then(function(value){
	// 	console.log(200,value);
	// }).catch(function(err){
	// 	var error = {};
	// 	error.statusCode = 501;
	// 	error.message = err.message;
	// 	console.log(501,error);
	// });

    // return;

	//console.log(data);

	data.createdBy = data.userEmail;
	data.modifiedBy = data.userEmail;

	mongo.mongo_insert(config.collectionName,data).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});

}

exports.getData = function(findParam,resultFunc){
	mongo.mongo_find(config.collectionName,findParam).then(function(value){
		if(value.length == 0){
			var resp = {};
			resp.statusCode = 401,
			resp.message = "No TeamMate found with this Email id !!";
			resultFunc(401,resp);
		}
		else if(value.length > 0){
			value.statusCode = 200;
			resultFunc(200,value);
		}
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}

exports.getDataById = function(email,resultFunc){
	var findParam = {};
	findParam.teamMemberEmail = email;
	findParam.isActive = 1;

	var selectParam = {};
	selectParam.teamMemberName = 1;
	selectParam.teamMemberEmail = 1;
	selectParam._id = 0;
	selectParam.isOwner = 1;
	selectParam.teamEmail = 1;

	mongo.mongo_find(config.collectionName,findParam,selectParam).then(function(value){
		
		if(value.length == 0){
			var resp = {};
			resp.statusCode = 401,
			resp.message = "No TeamMate found with this Email id !!";
			resultFunc(401,resp);
		}
		else if(value.length > 0){
			value.statusCode = 201;
			resultFunc(201,value);	
		}
		
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}

exports.getUniqueTeam = function(data,resultFunc){
	var findParam = {};
	findParam.teamMemberEmail = data.teamMemberEmail;
	findParam.teamEmail = data.teamEmail;
	findParam.isActive = 1;

	var selectParam = {};
	selectParam.teamMemberName = 1;
	selectParam.teamMemberEmail = 1;
	selectParam._id = 0;
	selectParam.isOwner = 1;
	selectParam.teamEmail = 1;

	mongo.mongo_find(config.collectionName,findParam,selectParam).then(function(value){
		
		if(value.length == 0){
			var resp = {};
			resp.statusCode = 200,
			resp.message = "No TeamMate found with this Email id !!";
			resultFunc(200,resp);
		}
		else if(value.length > 0){
			resultFunc(200,value[0]);	
		}
		
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}


exports.updateDataById = function(data,updateData,resultFunc){
	var condition = {};
	condition.teamEmail = data.teamEmail;
	condition.teamMemberEmail = data.teamMemberEmail;
	condition.isActive = 1;

	updateData.modifiedBy = updateData.userEmail;
	delete updateData.userEmail;
	updateData.modifiedOn = Date.now();

	
	mongo.mongo_update(condition,updateData,config.collectionName).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}

exports.updateTeamEmailByEmail = function(data,req,res,resultFunc){
	

	mongo.mongo_find(config.collectionName,data).then(function(value){

		//console.log(value);

		if((value[0].teamEmail && value[0].teamEmail == req.body.teamEmail) || (value.length == 0)){
			res.status(201).send({'status':201,'message':'nothing to update'});
		}
		else if(value[0].teamEmail){
			// insert it
			data.createdBy = data.teamMemberEmail;
			data.modifiedBy = data.teamMemberEmail;
			data.teamMemberName = value[0].teamMemberName;
			data.teamEmail = req.body.teamEmail;

			mongo.mongo_insert(config.collectionName,data).then(function(value){
				resultFunc(200,value);
			}).catch(function(err){
				var error = {};
				error.statusCode = 501;
				error.message = err.message;
				resultFunc(501,error);
			});
		}
		else if(value.teamEmail == null){
			var condition = {};
			condition.teamMemberEmail = data.teamMemberEmail;

			var updateData = {};
			updateData.teamEmail = req.body.teamEmail;
			updateData.modifiedBy = data.teamMemberEmail;
			updateData.modifiedOn = Date.now();

			mongo.mongo_update(condition,updateData,config.collectionName).then(function(value){
				resultFunc(200,value);
			}).catch(function(err){ 
				var error = {};
				error.statusCode = 501;
				error.message = err.message;
				resultFunc(501,error);
			});
		}

	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		res.status(501).send(error);
	});
}
