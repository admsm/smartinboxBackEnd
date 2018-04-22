'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.listenRouter = undefined;

var _http = require('http');

var _requestHelper = require('../helpers/requestHelper');

var express = require('express');

var listenRouter = exports.listenRouter = express.Router();
//import { subscriptionConfiguration } from '../config';

var redis = require('../helpers/redis');
var mongo = require('../helpers/mongo');
var config = require('../config');
var request = require('request');
var userEmail = '';
var accessToken = '';
var webHookData = {};
var mailFolderFlag = false;
var newMailFolderList = [];

/* Default listen route */
listenRouter.post('/', function (req, res, next) {
	var status = void 0;
	var clientStatesValid = void 0;
	if (req.query && req.query.validationToken) {
		status = 200;
		res.send(req.query.validationToken);
	} else {
		mailFolderFlag = false;
		newMailFolderList = [];

		var data = req.body;
		clientStatesValid = false;
		console.log(data);

		//First, validate all the clientState values in array
		for (var i = 0; i < data.value.length; i++) {
			var clientStateValueExpected = config.subscriptionConfiguration.clientState;

			if (data.value[i].clientState !== clientStateValueExpected) {
				// If just one clientState is invalid, we discard the whole batch
				clientStatesValid = false;
				break;
			} else {
				clientStatesValid = true;
			}
		}

		// If all the clientStates are valid, then process the notification
		if (clientStatesValid) {
			for (var _i = 0; _i < data.value.length; _i++) {
				var resource = data.value[_i].resource;
				var subscriptionId = data.value[_i].subscriptionId;
				processNotification(subscriptionId, resource, res, next);
			}
			status = 202;
		} else {
			status = 202;
		}
		
		res.status(status).send(_http.STATUS_CODES[status]);
	}
});

function processNotification(subscriptionId, resource, res, next) {
	redis.client.get('subscription:' + subscriptionId, function (err, email) {
		if (err) {
			console.log('Problem Getting Subscription Id', err.message);
		}
		userEmail = email;

		redis.client.hgetall('user:' + email, function (err, obj) {
			if (err) {
				console.log('Problem Getting Access Token from redis', err.message);
			}

			if (obj && obj.expirationTime < Date.now() + 2000) {
				(0, _requestHelper.getRequest)('getAccessToken?email=' + email,obj.jwtToken, function (requestError, tokenInfo) {
					if (requestError) throw new Error(requestError);//console.log('Problem getting access token', requestError);
					//console.log(tokenInfo);
					(0, _requestHelper.getData)('/v1.0/' + resource, tokenInfo.access_token, function (requestError, endpointData) {
						if (requestError) {
							console.log('Problem getting data from microsoft', requestError);
						}
						//console.log(endpointData);
						//var convData = formatData(endpointData);
						// findAndCompareAndUpdateConversation(convData,convData.conversationId);
						accessToken = tokenInfo.access_token;
						console.log(endpointData);
						webHookData = endpointData;
						checkFolderId(endpointData.parentFolderId, email, res, next)
						//var convoResponse = manageConversationCollection(endpointData, email, res, next);
					});
				});
			} else {
				(0, _requestHelper.getData)('/v1.0/' + resource, obj.accessToken, function (requestError, endpointData) {
					if (requestError) {
						console.log('Problem getting in accss token', requestError);
						return;
					}
					if (endpointData && endpointData.isDraft) {
						return; // dont update the drafts in the db.
					}
					//var convData = formatData(endpointData);
					// findAndCompareAndUpdateConversation(convData,convData.conversationId);
					if (obj.accessToken && endpointData) {
						accessToken = obj.accessToken;
						webHookData = JSON.parse(endpointData);
						console.log(webHookData.subject);
						checkFolderId(webHookData.parentFolderId, email, res, next)
						//var convoResponse = manageConversationCollection(endpointData, email, res, next);
					}
				});
			}
		});
	});
}



// function manageConversationCollection(data,email,res,next){

// 	var convoDataFromMicrosoft = data;
	
// 	// format according to conversation schema collection.
// 	var formattedDataForConversation = formatDataForConvo(convoDataFromMicrosoft);

// 	// format according to team conversation collection
// 	var formattedDataofTeamConvo = formattedDataForTeamConvo(convoDataFromMicrosoft);
// 	formattedDataofTeamConvo.teamEmail = email;
	
// 	console.log(formattedDataForConversation,formattedDataofTeamConvo);	
	
// 	// conversation id
// 	var convId = convoDataFromMicrosoft.conversationId;
	
// 	formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
// 	formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
// 	var dataToBeUpdated = formattedDataForConversation;

// 	var teamConvoDataForUpdate = formattedDataofTeamConvo;

// 	var conversationColConditions = {"conversationId" : dataToBeUpdated.conversationId}
// 	var teamConvoColConditions = {"conversationId" : teamConvoDataForUpdate.conversationId,"teamEmail":teamConvoDataForUpdate.teamEmail };
	 
// 	updateToMongo(conversationColConditions,dataToBeUpdated,config.conversationSchema,config.collectionName);
// 	updateToMongo(teamConvoColConditions,teamConvoDataForUpdate,config.teamConversationSchema,config.teamConvoCollectionName);
	
// }
// returns true if the folder id is the child of inbox
// returns false otherwise.
function checkFolderId(parentFolderId, email, res, next){
	console.log(parentFolderId);
	// checks whether the folder Id exists or not.
	var options = { method: 'GET',
	url: config.conversationUrl + '/mailFolders',
	qs: 
	 { teamEmail: email,
	   id: parentFolderId },
	headers: 
	 {} };
  
	request(options, function (error, response, body) {
		if (error) {
			return false;
		}
		var body = JSON.parse(body);
		//console.log(body.length);
		//console.log(body);
		if(body.length == 0){
			mailFolderFlag = true;
			traceFolderIdTree(parentFolderId, email, res, next);
			return;
		}
		else if(body && body[0].isInboxFolder == 0){
			if(mailFolderFlag){
				
				newMailFolderList.map(function (value) {
					value.isInboxFolder = 0;
				});
				
				insertMailFolder(newMailFolderList);
			}
			return;
		}
		else if(body && body[0].isInboxFolder == 1){
			if(mailFolderFlag){
				
				newMailFolderList.map(function (value) {
					value.isInboxFolder = 1;
				});
				
				// insert here
				insertMailFolder(newMailFolderList);
			}
			manageConversationCollection(webHookData, email, res, next);
		}
		return;
	});
}

function insertMailFolder(data){
	var options = { method: 'POST',
	url: config.conversationUrl+'/mailFolders',
	qs: { teamEmail: userEmail },
	headers: 
	{'content-type': 'application/json' },
	body: data,
	json: true };

request(options, function (error, response, body) {
	console.log(error);
  if (error) throw new Error(error);

  console.log(body);
});
}


function traceFolderIdTree(parentFolderId, email, res, next){
	//console.log(parentFolderId);
	var options = { 
		method: 'GET',
		  url: config.microsoftMailFolderUrl + parentFolderId,
		  headers: { 
			  authorization: accessToken,
			   'content-type': 'application/json' 
		   },
		json: true };

	request(options, function (error, response, body) {
		if(error){
			return;
		}
		delete body['@odata.context'];
		newMailFolderList.push(body);
		//console.log(newMailFolderList);
		checkFolderId(body['parentFolderId'], email, res, next);

	});
}

function manageConversationCollection(data, email, res, next) {
	//console.log(data);
	var convoDataFromMicrosoft = data;
	
	// format according to conversation schema collection.
	var formattedDataForConversation = formatDataForConvo(convoDataFromMicrosoft);

	// format according to team conversation collection
	var formattedDataofTeamConvo = formattedDataForTeamConvo(convoDataFromMicrosoft);
	formattedDataofTeamConvo.teamEmail = email;

	//console.log(formattedDataForConversation, formattedDataofTeamConvo);

	// conversation id
	var convId = convoDataFromMicrosoft.conversationId;
	//console.log(convId)
		mongo.mongo_find(config.collectionName,{"conversationId":convId}).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			//console.log('here');
			if(conversationData.length < 1){ // insert the conversation
				
				formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				//console.log(formattedDataForConversation);
				insertToMongo(config.collectionName,formattedDataForConversation,config.conversationSchema);
				//insertToMongo(config.teamConvoCollectionName,formattedDataofTeamConvo,config.teamConversationSchema);
			}
			else{ // update the conversation
				let conditionForConvoUpdate = {};
				conditionForConvoUpdate.conversationId = convId;
				//console.log(formattedDataForConversation);
				let conditionForTeamConvoUpdate = {};
				conditionForTeamConvoUpdate.conversationId = convId;
				conditionForTeamConvoUpdate.teamEmail = formattedDataofTeamConvo.teamEmail;

				delete formattedDataForConversation.subject;
				
				if(conversationData.hasAttachments === true){
					delete formattedDataForConversation.hasAttachments;
				}
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				
				updateToMongo(conditionForConvoUpdate,formattedDataForConversation,config.conversationSchema,config.collectionName);
				//updateToMongo(conditionForTeamConvoUpdate,formattedDataofTeamConvo,config.teamConversationSchema,config.teamConvoCollectionName);
			}

		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			console.log(err);
			//return errorMessage;
		});



		var teamConvoDataForUpdate = formattedDataofTeamConvo;

		//var conversationColConditions = {"conversationId" : dataToBeUpdated.conversationId}
		var teamConvoColConditions = {"conversationId" : teamConvoDataForUpdate.conversationId,"teamEmail":teamConvoDataForUpdate.teamEmail };
	 

		// for team convo
		mongo.mongo_find(config.teamConvoCollectionName,teamConvoColConditions).then(function(value){
			var foundData = JSON.stringify(value);
			var conversationData = JSON.parse(foundData);
			//console.log('here');
			if(conversationData.length < 1){ // insert the conversation
				
				formattedDataForConversation.createdBy = formattedDataForConversation.senderEmail;
				formattedDataForConversation.modifiedBy = formattedDataForConversation.senderEmail;
				
				insertToMongo(config.teamConvoCollectionName,formattedDataofTeamConvo,config.teamConversationSchema);
			}
			else{ // update the conversation
				//console.log(formattedDataForConversation);
				let conditionForTeamConvoUpdate = {};
				conditionForTeamConvoUpdate.conversationId = convId;
				conditionForTeamConvoUpdate.teamEmail = formattedDataofTeamConvo.teamEmail;
				//updateToMongo(conditionForConvoUpdate,formattedDataForConversation,config.conversationSchema,config.collectionName);
				updateToMongo(conditionForTeamConvoUpdate,formattedDataofTeamConvo,config.teamConversationSchema,config.teamConvoCollectionName);
			}

			callToRules(convoDataFromMicrosoft,email);


		}).catch(function (err) {
			var errorMessage = {};
			errorMessage.statusCode = 501;
			errorMessage.message = err.message;
			console.log(err);
			//return errorMessage;
		});
}

function callToRules(data,teamEmail){
	data.event = 1;
	data.teamEmail = teamEmail;

	var options = { 
		method: 'POST',
  		url: config.rulesUrl + '/checkRules',
  		headers:{ 
  			'content-type': 'application/json' 
  		},
		  body: data,
		  json : true
  	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);
	});
}


function insertToMongo(collectionName,convoData,schema) {
	mongo.mongo_insert(collectionName, convoData, schema).then(function (value) {
		console.log(value);
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		console.log(err);
		//return errorMessage;
	});
}

function updateToMongo(condition, convoData, schema, collection) {
	mongo.mongo_update(condition, convoData, schema, collection).then(function (value) {
		//console.log("Database Updated");
	}).catch(function (err) {
		if (err && err.message) {
			console.log(err.message);
		} else if (err) {
			console.log(err);
		} else {
			console.log("Some Prblem in Error Message");
		}
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

// function formatData(data){
// 	var dataToBeInserted = {};

// 	if(!data){
// 		return {};
// 	}

// 	if(data.sender && data.sender.emailAddress && data.sender.emailAddress.address)
// 		dataToBeInserted.senderEmail = data.sender.emailAddress.address;

// 	if(userEmail != '')
// 		dataToBeInserted.teamEmail = userEmail;

// 	if(data.internetMessageId)
// 		dataToBeInserted.internetMessageId = data.internetMessageId;

// 	if(data.id)
// 		dataToBeInserted.messageId = [data.id];

// 	if(data.subject)
// 		dataToBeInserted.subject = data.subject;

// 	if(data.bodyPreview)
// 		dataToBeInserted.bodyPreview = data.bodyPreview;

// 	if(data.flag && data.flag.flagStatus)
// 		dataToBeInserted.flagStatus = data.flag.flagStatus;

// 	if(data.isDraft)
// 		dataToBeInserted.isDraft = data.isDraft;

// 	if(data.isRead)
// 		dataToBeInserted.isRead = data.isRead;

// 	if(data.conversationIndex)
// 		dataToBeInserted.conversationIndex = data.conversationIndex;

// 	if(data.conversationId)
// 		dataToBeInserted.conversationId = data.conversationId;

// 	if(data.sender && data.sender.emailAddress && data.sender.emailAddress.name)
// 		dataToBeInserted.senderName = data.sender.emailAddress.name;

// 	if(data.hasAttachments)
// 		dataToBeInserted.hasAttachments = data.hasAttachments;

// 	if(data.sentDateTime)
// 		dataToBeInserted.sentDateTime = data.sentDateTime;

// 	if(data.lastModifiedDateTime)
// 		dataToBeInserted.lastModifiedDateTime = data.lastModifiedDateTime;

// 	if(data.receivedDateTime)
// 		dataToBeInserted.receivedDateTime = data.receivedDateTime;

// 	return dataToBeInserted;
// }

// function insertConversation(data){
// 	//console.log(data);
// 	mongo.mongo_insert("conversationcollection",data).then(function(value){
//                 //console.log('inserted');
//                 console.log(value);
//                 //res.status(200).send(value);
// 		}).catch(function(err){
//         	var errorMessage = {};
//         	errorMessage.status = 400;
//     		errorMessage.message = err.message;
//         	//console.log(errorMessage);
//     		//res.send(errorMessage);
//     });
// }

// function findAndCompareAndUpdateConversation(data,convId){
// 	mongo.mongo_find("conversationcollection",{"conversationId":convId}).then(function(value){
// 	    var foundData = JSON.stringify(value);
// 	    var conversationData = JSON.parse(foundData);
// 		//console.log(conversationData);
// 		if(conversationData.length < 1){
// 			insertConversation(data);
// 	    }else if(data.internetMessageId != conversationData[0].internetMessageId && conversationData[0].messageId.indexOf(data.messageId[0]) == -1){
//     		console.log(data.internetMessageId);
//     		console.log(conversationData[0]);
//     		data.messageId = data.messageId.concat(conversationData[0].messageId);
//     		updateConversation(data);
//     		//addMessageToConversation(data,data.messageId);
//     	}else if(conversationData.length == 1 && !(conversationData[0].isRead == data.isRead && conversationData[0].isDraft == data.isDraft 
//     		&& conversationData[0].flagStatus == data.flagStatus)) {
//     		var updateData = {};
//     		updateData.isRead = conversationData[0].isRead;
//     		updateData.flagStatus = conversationData[0].flagStatus;
//     		updateConversation(updateData);
//     	}

// 	});
// }	

// function updateConversation(data){
// 	//console.log(data);
// 	var update = data;
// 	var conditions = {conversationId : data.conversationId};
// 	//console.log(update);
// 	mongo.mongo_update(conditions,update,"conversationcollection").then(function(value){
// 		console.log("Updated the Conversation Collection");
// 	});
// }