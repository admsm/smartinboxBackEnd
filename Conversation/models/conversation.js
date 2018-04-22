'use strict';

var _requestHelper = require('../helpers/requestHelper');

var redis = require('../helpers/redis');
var mongo = require('../helpers/mongo');
var config = require('../config');
var request = require("request");



var nextLink = null;
var accessToken = null;
var userEmail = null;
var mailFolderList = [];
var requiredFolders = [];
var userEmail = '';
var lastDate = '';


exports.insertToMailFolders = function(data,email, res, next, resultFunc){
	res.send(insertToMailFolder(data,email));
}

function insertToMailFolder(data,email){
	
	mongo.mongo_insert_many(config.mailFolderCollectionName, data, config.mailFolderSchema,email).then(function (value) {
		var resp = {};
		resp.message = "Successfully inserted.";
		resp.statusCode = 201;
		return resp;
		//res.status(201).send({'message':value,'statusCode' : '201'});
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		return errorMessage;
		//res.status(501).send({'message':err.message,'statusCode' : '501'});
	});
}

function updateToMailFolder(data,email){
	mongo.mongo_update_many(config.mailFolderCollectionName, data, config.mailFolderSchema,email).then(function (value) {
		var resp = {};
		resp.message = "Successfully updated.";
		resp.statusCode = 201;
		return value;
		//res.status(201).send({'message':value,'statusCode' : '201'});
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		return errorMessage;
		//res.status(501).send({'message':err.message,'statusCode' : '501'});
	});
}

exports.getAllMessageByFolder = function(data, res, next, resultFunc){
	
	// syncing through mailfolders. Reliable method.
	userEmail = data.email;
	lastDate = data.lastDate;

	// first u get the token.
	(0, _requestHelper.getRequest)(userEmail, function (requestError, tokenInfo) {

		if (requestError) {
			var resp = {};
			resp.statusCode = 501;

			if (requestError.message) resp.message = requestError.message;else if (requestError.error && requestError.error.message) resp.message = requestError.error.message;else resp.message = "something went wrong in refreshing the token";

			res.status(501).send(resp);
			return;
		}

		accessToken = tokenInfo.access_token;
		
		var url = 'https://graph.microsoft.com/v1.0/me/mailFolders/delta';
		// collect all mailfolders.
		//console.log(data.lastDate);
		// console.log(tokenInfo);
		// return;
		collectAllMailFolders(url,res,next);
		//return accessToken;
	});

}

exports.getMailFolder = function(data, res, next,resultFunc){
	mongo.mongo_find(config.mailFolderCollectionName, data).then(function (value) {
		res.status(201).send(value);
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		res.status(501).send(errorMessage);
	});
}


function collectAllMailFolders(url,res,next){
	//console.log(lastDate);
		var options = { 
			method: 'GET',
		  	url: url,
		  	headers: { 
		  		authorization: accessToken,
		   		'content-type': 'application/json' 
		   	},
		    json: true };

		request(options, function (error, response, body) {
		  	if (error) throw new Error(error);

		  	
		  	Array.prototype.push.apply(mailFolderList,body.value); 
			
			if(body['@odata.nextLink']){
		  		collectAllMailFolders(body['@odata.nextLink'],res,next);
		  	}

		  	if(body['@odata.deltaLink']){
				insertToMailFolder(mailFolderList,userEmail);// async operation not affecting the flow
			
		  		requiredFolders.push(getInboxFolderInfo(mailFolderList));
				  redis.client.hmset(["user:"+userEmail,"inboxId",requiredFolders[0].id], function (err, res) {
						if(err){
							console.log(err);
						}
					});
		  		if(requiredFolders[0].childFolderCount > 0){
		  			requiredFolders = getInboxChildFolders(mailFolderList,requiredFolders[0].id);
		  		}
				
				updateToMailFolder(requiredFolders,userEmail);  
				//   console.log(requiredFolders);
				//   return;
		  		requiredFolders.forEach(function (value) {
					let url = "https://graph.microsoft.com/v1.0/me/mailFolders/"+value.id+"/messages/delta?$filter=receivedDateTime+ge+" + 	lastDate;
		  			callToGetConversationData(value,url,res,next);
				});
			    res.status(201).send({'status' : '201','message' : 'Database Sync is in Progress.'});
		  	}
		});
}

function getInboxFolderInfo(mailFolderList){
	for(let key in mailFolderList){
		if(mailFolderList[key].displayName == "Inbox"){
			return mailFolderList[key];
		}
	}
}



function getInboxChildFolders(mailFolderList,parentId){
	var childFolders = mailFolderList.filter(function(value){
		return (value.parentFolderId == parentId);
	});


	childFolders.forEach(function (e) {
		requiredFolders.push(e);
        getInboxChildFolders(mailFolderList, e.id);
    })

	return requiredFolders;
}



function callToGetConversationData(mailFolderInfo,url, res, next) {
	if(!accessToken){
		callToRefreshToken(mailFolderInfo,url, res, next);
	}

	var options = { 
			method: 'GET',
		  	url: url,
		  	headers: { 
		  		authorization: accessToken,
		   		'content-type': 'application/json' 
		   	},
		    json: true };

		request(options, function (error, response, body) {
			if (error) throw new Error(error);
			
			if(body['@odata.nextLink']){
				// insert here.
				insertMails(body.value,res,next);
		  		//callToGetConversationData(mailFolderInfo,body['@odata.nextLink'],res,next);
		  	}

		  	if(body['@odata.deltaLink'] && body.value){
		  		insertMails(body.value,res,next);
		  		// if anything u want to do in end.
		  	}
		});
}

function insertMails(mailData,res,next){
	//console.log(mailData);
	let convLength = mailData.length;
	var j = 0;
	var m = 0;
	var insertionArr = [];
	var teamConvoDataForInsert = [];

	mailData.map(function (value) {

		// format according to conversation schema collection.
		var formattedDataForConversation = formatDataForConvo(value);

		// format according to team conversation collection
		var formattedDataofTeamConvo = formattedDataForTeamConvo(value);
		formattedDataofTeamConvo.teamEmail = userEmail;
		//console.log(formattedDataofTeamConvo);
		// conversation id
		var convId = value.conversationId;

		//convo
		mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			
			if(conversationData.length < 1){ // insert the conversation
				formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				insertionArr[convId] = formattedDataForConversation;
			}

			j++;

			if(j == convLength){
				//insert here.
				insertIntoMongo(config.collectionName,insertionArr,config.conversationSchema);
				console.log(insertionArr);
			}

		});

		// team convo
		mongo.mongo_find(config.teamConvoCollectionName,{"conversationId":convId,"teamEmail":userEmail}).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			
			if(conversationData.length < 1 && !teamConvoDataForInsert[convId + "_" + userEmail] ){ // insert the conversation
				teamConvoDataForInsert[convId + "_" + userEmail] = formattedDataofTeamConvo;
			}
			else if(conversationData.length < 1 && teamConvoDataForInsert[convId + "_" + userEmail] && new Date(teamConvoDataForInsert[convId + "_" + userEmail].receivedDateTime).getTime() < new Date(formattedDataofTeamConvo.receivedDateTime).getTime()){
				teamConvoDataForInsert[convId + "_" + userEmail] = formattedDataofTeamConvo;//&& teamConvoDataForInsert[convId + "_" + userEmail].receivedDateTime.getTime() < formattedDataofTeamConvo.receivedDateTime.getTime()	
			}

			m++;

			if(m == convLength){
				console.log(teamConvoDataForInsert);
				insertIntoMongo(config.teamConvoCollectionName,teamConvoDataForInsert,config.teamConversationSchema);
			}

		});

	});
}


function callToRefreshToken(mailFolderInfo,url, res, next) {
	(0, _requestHelper.getRequest)('getAccessToken?email=' + userEmail, function (requestError, tokenInfo) {

		if (requestError) {
			var resp = {};
			resp.statusCode = 501;

			if (requestError.message) resp.message = requestError.message;else if (requestError.error && requestError.error.message) resp.message = requestError.error.message;else resp.message = "something went wrong in refreshing the token";

			res.status(501).send(resp);
			return;
		}

		accessToken = tokenInfo.access_token;
		callToGetConversationData(mailFolderInfo,url, res, next);
	});
}



exports.getAllMessage = function (data, res, next, resultFunc) {
	userEmail = data.email;
	var url = "/v1.0/users/" + data.email + "/messages?$filter=receivedDateTime+ge+" + data.lastDate;
	redis.client.hgetall('user:' + data.email, function (err, obj) {

		if (err) {
			var resp = {};
			resp.statusCode = 501;
			resp.message = err.message;
			resultFunc(501, resp);
		}

		if (obj.expirationTime < Date.now()) {
			callToRefreshToken(url, res, next);
		} else {
			accessToken = obj.accessToken;
			callToGetData(url, accessToken, res, next);
		}
	});
};

function callToRefreshToken(url, res, next) {
	(0, _requestHelper.getRequest)('getAccessToken?email=' + userEmail, function (requestError, tokenInfo) {

		if (requestError) {
			var resp = {};
			resp.statusCode = 501;

			if (requestError.message) resp.message = requestError.message;else if (requestError.error && requestError.error.message) resp.message = requestError.error.message;else resp.message = "something went wrong in refreshing the token";

			res.status(501).send(resp);
			return;
		}

		accessToken = tokenInfo.access_token;
		callToGetData(url, accessToken, res, next);
	});
}

function callToGetData(url, accessToken, res, next) {
	(0, _requestHelper.getData)(url, accessToken, function (requestError, endpointData) {

		if (requestError) {

			var resp = {};
			resp.statusCode = 501;
			resp.message = "Something went wrong while fetching the data from Microsoft";

			if (requestError.error && requestError.error.message) resp.message = requestError.error.message;

			if (requestError.error && requestError.error.code && requestError.error.code == "InvalidAuthenticationToken") {
				callToRefreshToken(url, res, next);
				return;
			}
			res.status(501).send(resp); //check this for error handling
		}

		//get the nextLink
		if (endpointData && endpointData['@odata.nextLink']) nextLink = endpointData['@odata.nextLink'];else if (endpointData && (!endpointData['@odata.nextLink'] || endpointData['@odata.nextLink'] == 'undefined')) nextLink = null;
		//console.log(nextLink);
		//console.log(endpointData);
		if (endpointData) var convoResponse = manageConversationCollection(endpointData, userEmail, res, next);

		if (convoResponse && convoResponse.statusCode == 501) {
			return convoResponse;
		}
	});
}

function manageConversationCollection(data, email, res, next) {

	var convoDataFromMicrosoft = data.value;
	var convoDataLength = convoDataFromMicrosoft.length;

	if (convoDataLength < 1) {
		var resp = {};
		resp.statusCode = 501;
		resp.message = "No data Found !!";

		return resp;
	}

	var conversationIds = [];
	var dataToBeUpdated = [];
	var insertionArr = [];
	var updationArr = [];
	var teamConvoDataForInsert = [];
	var teamConvoDataForUpdate = [];
	var j = 0;
	//console.log(convoDataFromMicrosoft);
	convoDataFromMicrosoft.map(function (value) {

		// format according to conversation schema collection.
		var formattedDataForConversation = formatDataForConvo(value);

		// format according to team conversation collection
		var formattedDataofTeamConvo = formattedDataForTeamConvo(value);
		formattedDataofTeamConvo.teamEmail = email;
		//console.log(formattedDataofTeamConvo);
		// conversation id
		var convId = value.conversationId;

		//convo
		mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			
			if(conversationData.length < 1){ // insert the conversation
				
				formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				insertionArr[convId] = formattedDataForConversation;
				teamConvoDataForInsert[convId + "_" + email] = formattedDataofTeamConvo;
			}
			else{
				let conditionForConvoUpdate = {};
				conditionForConvoUpdate.conversationId = convId;

				delete formattedDataForConversation.subject;
				
				if(conversationData.hasAttachments === true){
					delete formattedDataForConversation.hasAttachments;
				}
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				updationArr[convId] = formattedDataForConversation;
				teamConvoDataForUpdate[convId + "_" + email] = formattedDataofTeamConvo;
			}

			j++;
			
			if(j == convoDataLength){ // in the end insert and update the db
				
				insertToMongo(config.collectionName,insertionArr,config.conversationSchema);
				insertToMongo(config.teamConvoCollectionName,teamConvoDataForInsert,config.teamConversationSchema);
				//console.log(updationArr,insertionArr);
				updateToMongo(config.collectionName,updationArr,config.conversationSchema);
				updateToMongo(config.teamConvoCollectionName,teamConvoDataForUpdate,config.teamConversationSchema);

				if (nextLink || nextLink != null) {
					callToGetData(nextLink, accessToken, res, next);
				} else {
					var resp = {};
					resp.statusCode = 200;
					resp.message = "Database Updated";
					res.status(200).send(resp);
				}
		
			}

		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			console.log(err);
			//return errorMessage;
		});



		// teamConvo
		mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			
			if(conversationData.length < 1){ // insert the conversation
				
				formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				insertionArr[convId] = formattedDataForConversation;
				teamConvoDataForInsert[convId + "_" + email] = formattedDataofTeamConvo;
			}
			else{
				let conditionForConvoUpdate = {};
				conditionForConvoUpdate.conversationId = convId;

				delete formattedDataForConversation.subject;
				
				if(conversationData.hasAttachments === true){
					delete formattedDataForConversation.hasAttachments;
				}
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				updationArr[convId] = formattedDataForConversation;
				teamConvoDataForUpdate[convId + "_" + email] = formattedDataofTeamConvo;
			}

			j++;
			
			if(j == convoDataLength){ // in the end insert and update the db
				
				insertToMongo(config.collectionName,insertionArr,config.conversationSchema);
				insertToMongo(config.teamConvoCollectionName,teamConvoDataForInsert,config.teamConversationSchema);
				//console.log(updationArr,insertionArr);
				updateToMongo(config.collectionName,updationArr,config.conversationSchema);
				updateToMongo(config.teamConvoCollectionName,teamConvoDataForUpdate,config.teamConversationSchema);
				
				if (nextLink || nextLink != null) {
					callToGetData(nextLink, accessToken, res, next);
				} else {
					var resp = {};
					resp.statusCode = 200;
					resp.message = "Database Updated";
					res.status(200).send(resp);
				}
		
			}

		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			console.log(err);
			//return errorMessage;
		});



		// formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
		// formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
		// dataToBeUpdated[convId] = formattedDataForConversation;

		// teamConvoDataForUpdate[convId + "_" + email] = formattedDataofTeamConvo;

		// j++;

		// if (j == convoDataLength) {
		// 	// in the end insert and update the db

		// 	//update to mongo
		// 	console.log(dataToBeUpdated,teamConvoDataForUpdate);
		// 	updateToMongo(config.collectionName, dataToBeUpdated, config.conversationSchema);
		// 	updateToMongo(config.teamConvoCollectionName, teamConvoDataForUpdate, config.teamConversationSchema);

		// 	if (nextLink || nextLink != null) {
		// 		callToGetData(nextLink, accessToken, res, next);
		// 	} else {
		// 		var resp = {};
		// 		resp.statusCode = 200;
		// 		resp.message = "Database Updated";
		// 		res.status(200).send(resp);
		// 	}
		// }
	});
}

function insertToMongo(collectionName,convoData,schema) {
	//console.log(convoData);
	for( var key in convoData){
		mongo.mongo_insert(collectionName, convoData[key], schema).then(function (value) {
			//console.log(value);
		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			//console.log(err);
			//return errorMessage;
		});
	}
}

function updateToMongo(collectionName,convoData,schema) {
	//console.log(convoData);
	//return;
	for( var key in convoData){
		//console.log(convoData[key]);
		var condition = {};
		condition.teamEmail = convoData.teamEmail;
		condition.conversationId = convoData.conversationId;
		
		mongo.mongo_update(condition,convoData[key],collectionName, schema).then(function (value) {
			//console.log(value);
		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			//console.log(err);
			//return errorMessage;
		});
	}
	// convoData.map(function (value) {
	// 	console.log(value);
	// });
}


function insertIntoMongo(collectionName, convoData, schema) {

	mongo.mongo_insert_many(collectionName, convoData, schema).then(function (value) {

		//console.log(value);
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		//console.log(err);
		return errorMessage;
	});
}

function updateInToMongo(collectionName, convoData, schema) {
	mongo.mongo_update_many(collectionName, convoData, schema).then(function (value) {
		//continue;
	}).catch(function (err) {
		//console.log(err);
		//   	var errorMessage = {};
		//   	errorMessage.statusCode = 501;
		// errorMessage.message = err.message;
		//   	return errorMessage;
	});
}

function formatDataForConvo(data) {

	var formattedData = {};

	if (data.subject) {
		formattedData.subject = data.subject;
	}

	// if(data.flag && data.flag.flagStatus){
	// 	formattedData.flagStatus = data.flag.flagStatus;
	// }

	// if(data.isDraft)
	// 	formattedData.isDraft = data.isDraft;

	// if(data.isRead)
	// 	dataToBeFormated[counter].isRead = data.isRead;

	// if(data.conversationIndex)
	// 	formattedData.conversationIndex = data.conversationIndex;

	if (data.conversationId) formattedData.conversationId = data.conversationId;

	if (data.sender && data.sender.emailAddress && data.sender.emailAddress.address) {
		formattedData.senderEmail = data.sender.emailAddress.address;
	}

	// if(data.isActive)
	// 	dataToBeFormated[counter].isActive = 1;

	// if(data.isArcheive)
	// 	dataToBeFormated[counter].isArcheive = 0;

	if (data.createdDateTime) formattedData.createdDateTime = data.createdDateTime;

	return formattedData;

	//dataToBeFormated[counter].teamEmail = email;
	//dataToBeFormated[counter].assignTo = null;
}

function formattedDataForTeamConvo(data) {
	var formattedData = {};

	formattedData.isArcheive = false;
	formattedData.isActive = true;
	formattedData.assignTo = null;

	if (data.sender && data.sender.emailAddress && data.sender.emailAddress.name) {
		formattedData.senderName = data.sender.emailAddress.name;
	}

	if (data.subject) {
		formattedData.subject = data.subject;
	}

	if (data.sender && data.sender.emailAddress && data.sender.emailAddress.address) {
		formattedData.senderEmail = data.sender.emailAddress.address;
	}

	if (data.bodyPreview) {
		formattedData.bodyPreview = data.bodyPreview;
	}

	if (data.sentDateTime) formattedData.sentDateTime = data.sentDateTime;

	if (data.lastModifiedDateTime) formattedData.lastModifiedDateTime = data.lastModifiedDateTime;

	if (data.receivedDateTime) formattedData.receivedDateTime = data.receivedDateTime;

	if (data.isRead || data.isRead == false) formattedData.isRead = data.isRead;

	if (data.conversationId) formattedData.conversationId = data.conversationId;

	if (data.hasAttachments || data.hasAttachments === false) formattedData.hasAttachments = data.hasAttachments;

	return formattedData;
}

// function formatData(docs,email){
// 	var counter = 0;
// 	var dataToBeFormated = [];

// 	docs.forEach(function(data){

// 		dataToBeFormated[counter] = {};

// 		if(data.sender && data.sender.emailAddress && data.sender.emailAddress.name){
// 			dataToBeFormated[counter].senderName = data.sender.emailAddress.name;
// 		}

// 		if(data.subject){
// 			dataToBeFormated[counter].subject = data.subject;
// 		}

// 		if(data.sender.emailAddress.address)
// 		 	dataToBeFormated[counter].senderEmail = data.sender.emailAddress.address;

// 		if(data.bodyPreview)
// 			dataToBeFormated[counter].bodyPreview = data.bodyPreview;

// 		if(data.flag && data.flag.flagStatus)
// 			dataToBeFormated[counter].flagStatus = data.flag.flagStatus;

// 		if(data.isDraft)
// 			dataToBeFormated[counter].isDraft = data.isDraft;

// 		if(data.isRead)
// 			dataToBeFormated[counter].isRead = data.isRead;

// 		if(data.conversationIndex)
// 			dataToBeFormated[counter].conversationIndex = data.conversationIndex;

// 		if(data.conversationId)
// 			dataToBeFormated[counter].conversationId = data.conversationId;

// 		if(data.hasAttachments)
// 			dataToBeFormated[counter].hasAttachments = data.hasAttachments;

// 		if(data.sentTime)
// 			dataToBeFormated[counter].sentTime = data.sentDateTime;

// 		if(data.isActive)
// 			dataToBeFormated[counter].isActive = 1;

// 		if(data.isArcheive)
// 			dataToBeFormated[counter].isArcheive = 0;

// 		if(data.lastModifiedDateTime)
// 			dataToBeFormated[counter].lastModifiedDateTime = data.lastModifiedDateTime;

// 		if(data.receivedDateTime)
// 			dataToBeFormated[counter].receivedDateTime = data.receivedDateTime;

// 		dataToBeFormated[counter].teamEmail = email;
// 		dataToBeFormated[counter].assignTo = null;

// 		counter++;
// 	});
// 	return dataToBeFormated;
// }

// function findAndCompareAndUpdateConversation(data){

// 	for(let i=0;i<data.length;i++){

// 		if(i == (data.length - 1) && nextLink){
// 			getMoreData(nextLink);
// 		}
// 		else if(i == (data.length - 1) && (!nextLink || nextLink == null)){
// 			return; // end of the request.
// 		}

// 		var convId = data[i].conversationId;

// 		mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){

// 			var foundData = JSON.stringify(value);
// 			var conversationData = JSON.parse(foundData);

// 			if(conversationData.length < 1){ // insert the conversation
// 				mongo.mongo_insert(config.collectionName,data[i]).then(function(value){
//                 	//continue;
// 				}).catch(function(err){
// 		        	var errorMessage = {};
// 		        	errorMessage.status = 400;
// 		    		errorMessage.message = err.message;
// 		        	console.log(errorMessage);
// 		    		//res.send(errorMessage);
//     			});	
// 			}
// 			else {
// 				// update it
// 				mongo.mongo_update({conversationId : data[i].conversationId},data[0],config.collectionName).then(function(value){
// 					//continue;
// 				}).catch(function(err){
// 		        	var errorMessage = {};
// 		        	errorMessage.status = 400;
// 		    		errorMessage.message = err.message;
// 		        	console.log(errorMessage);
// 		    		//res.send(errorMessage);
//     			});
// 			}

// 		}).catch(function(err){
// 	        	var errorMessage = {};
// 	        	errorMessage.status = 400;
// 	    		errorMessage.message = err.message;
// 	        	//console.log(errorMessage);
// 	    		//res.send(errorMessage);
//     	});

// 		//console.log(data[i]);
// 	}


// if(data.length > 20 || data.length < 1){
// 	if(nextLink){
// 		getMoreData(nextLink);
// 	}
// 	else{
// 		console.log('end');
// 	}
// 	return;
// }

// var convId = data[0].conversationId;

// mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){
//     var foundData = JSON.stringify(value);
//     var conversationData = JSON.parse(foundData);

// 	if(conversationData.length < 1){

// 		mongo.mongo_insert(config.collectionName,data[0]).then(function(value){
//                //console.log(value);
//                data.splice(0,1);
// 			findAndCompareAndUpdateConversation(data);

// 		}).catch(function(err){
//         	var errorMessage = {};
//         	errorMessage.status = 400;
//     		errorMessage.message = err.message;
//         	//console.log(errorMessage);
//     		//res.send(errorMessage);
//    		});


//     }else if(data[0].internetMessageId != conversationData[0].internetMessageId && conversationData[0].messageId.indexOf(data[0].messageId[0]) == -1){
//    		data[0].messageId = data[0].messageId.concat(conversationData[0].messageId);
//    		mongo.mongo_update({conversationId : data[0].conversationId},data[0],config.collectionName).then(function(value){
// 			data.splice(0,1);
// 			findAndCompareAndUpdateConversation(data);
// 		});
// 	}
//    	else{
//    		data.splice(0,1);
// 		findAndCompareAndUpdateConversation(data);
//    	}
// });
//}	

// function updateConversation(data){
// 	//console.log(data);
// 	var update = data;
// 	var conditions = {conversationId : data.conversationId};
// 	//console.log(update);

// }

// function getMoreData(nextMessageLink){
// 	getData(
// 			nextMessageLink,
// 			accessToken,
// 			(requestError, endpointData) => {

// 				//bulk insert in mongo
// 				if(endpointData['@odata.nextLink'])
// 					nextLink = endpointData['@odata.nextLink'];
// 				else
// 					nextLink = null;

// 				manageConversationCollection(formatData(endpointData.value,userEmail));
// 			}
// 		);
// }

exports.getAllConvoFromDB = function (data, res, next, callback) {
	var limit = 1000;
	var skip = 0;
	if (data.limit) {
		limit = data.limit;
	}

	if (data.skip) {
		skip = data.skip;
	}

	mongo.mongo_find(config.teamConvoCollectionName, { "teamEmail": data.email, "isArcheive": false, "isActive": true }, { 'lastModifiedDateTime': -1 }, limit, skip).then(function (value) {
		//console.log(value);
		res.send(value);
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.status = 501;
		errorMessage.message = err.message;
		res.send(errorMessage);
	});
};

exports.getTrashConvoFromDB = function (data, res, next, callback) {
	var limit = 1000;
	var skip = 0;
	if (data.limit) {
		limit = data.limit;
	}

	if (data.skip) {
		skip = data.skip;
	}

	mongo.mongo_find(config.teamConvoCollectionName, { "teamEmail": data.email, "isActive": false }, { 'lastModifiedDateTime': -1 }, limit, skip).then(function (value) {
		//console.log(value);
		res.send(value);
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.status = 501;
		errorMessage.message = err.message;
		res.send(errorMessage);
	});
};


exports.updateDataById = function(data,updateData,res,next,resultFunc){
	updateData.modifiedOn = Date.now();
	mongo.mongo_update(data,updateData,config.teamConvoCollectionName,config.teamConversationSchema).then(function(value){
		resultFunc(200,value);
	}).catch(function(err){ 
		var error = {};
		error.statusCode = 501;
		error.message = err.message;
		resultFunc(501,error);
	});
}