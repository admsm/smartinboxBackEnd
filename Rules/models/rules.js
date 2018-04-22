var config = require("../config");
var mongo = require("../helpers/mongo");
var request = require("request");
var redis = require("../helpers/redis");

exports.postRules = function (data, res, next, resultFunc) {
	
	var conditionData = [];

	for(var resultKey in data.result){
		
		var obj = data.result[resultKey];
		
		if(obj.key !== 'assignTo' && obj.key !== 'addTag' && obj.key !== 'removeTag' && obj.key !== 'archeiveConv'){
			res.statusCode = 501;
			res.send({"statusCode" : 501 ,"message" : "Invalid result type"});
			return;
		}
	}
	
	for(var conditionKey in data.condition){
		
		var obj = data.condition[conditionKey];
		
		if(obj.key !== 'from' && obj.key !== 'fromRegex' && obj.key !== 'subject' && obj.key !== 'subjectRegex' && obj.key !== 'bodyRegex' && obj.key !== 'importance'){
			res.statusCode = 501;
			res.send({"statusCode" : 501 ,"message" : "Invalid condition type"});
			return;
		}
	}
	
	data.teamMemberEmail = res.locals.loggedInEmail;
	// insert into the rules table
	mongo.mongo_insert(config.rulesCollection, data, config.rulesSchema).then(function (value) {
		res.status(201).send({'message' : 'Rules Saved Successfully!', "statusCode" : 201});
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		res.status(501).send(errorMessage);
	});
}


exports.checkRules = function (data, res, next, resultFunc) {
	// step - 1 : Fetch all the rules of the team email
	var conditionsOutput = [];
	console.log(data.teamEmail,data);
	var filter = {};
	filter.teamEmail = data.teamEmail;
	filter.isActive = true;
	filter.event = data.event;

	mongo.mongo_find(config.rulesCollection, filter).then(function (value) {
		
		if(value.length > 0){

			var resultSet = [];	

			// iterating all the rules
			for(var i in value){
				
				var rulesOpt = false;

				var foundData = JSON.stringify(value[i]);
        		var rulesData = JSON.parse(foundData);
        		var rulesConditions = rulesData.conditions;

				for(var rulesIndex in rulesConditions){
					
					//console.log(rulesConditions.length);

					let conditionFrom = rulesConditions[rulesIndex].key;
					let conditionKeyword = rulesConditions[rulesIndex].value;

					//console.log(conditionsOutput);
					// if already the condition is being processed
					if(conditionsOutput[conditionFrom+"_"+conditionKeyword] == false || conditionsOutput[conditionFrom+"_"+conditionKeyword]  == true){
						rulesOpt = conditionsOutput[conditionFrom+"_"+conditionKeyword];
					}
					else{
						switch(conditionFrom){
						
							case "from" :
							
							if(data && data.from && data.from.emailAddress && data.from.emailAddress.address && data.from.emailAddress.address == conditionKeyword){
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = rulesOpt = true;
							}
							else{
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = false;
							}

							break;

							case "fromRegex":
							
							var regularExp = new RegExp(conditionKeyword,'g');

							if(data && data.from && data.from.emailAddress && data.from.emailAddress.address && data.from.emailAddress.address.match(regularExp)){
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = rulesOpt = true;
							}
							else{
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = false;
							}

							break;

							case "subject":
							
							if(data && data.subject && data.subject == conditionKeyword){
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = rulesOpt = true;
							}
							else{
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = false;
							}

							break;

							case "subjectRegex":
							
							var regularExp = new RegExp(conditionKeyword,'g');
							
							if(data && data.subject && data.subject.match(regularExp)){
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = rulesOpt = true;
							}
							else{
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = false;
							}

							break;

							case "importance":
							
							if(data && data.importance && data.importance == conditionKeyword){
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = rulesOpt = true;
							}
							else{
								conditionsOutput[conditionFrom+"_"+conditionKeyword] = false;
							}

							break;

							default:
							break;

						}
					}

					if(rulesData.conditionType == 'or' && rulesOpt){
						break; // if it is true then there is no need check other condition.
					}
					else if(rulesData.conditionType == 'and' && !rulesOpt){
						break; // if it is false then there is no need check other condition.
					}

				}


				for(var j in rulesData.result){

					let rule = rulesData.result[j];
					
					if(rulesOpt){
						resultSet[rule["key"]] = rule["value"];
					}

					// if(rulesOpt && rule["key"] == 'assignTo' && resultSet && resultSet[rule["key"]] && resultSet[rule["key"]] != rule["value"]){
					// 	resultSet[rule["key"]] = "unassigned";
					// }
					// else 

				}

				
			}

			// get the token
            redis.client.hgetall('user:'+data.teamEmail,function(error1,obj){
                
                if(error1) throw new Error(error1);
				
				if(resultSet['assignTo'])
					callToAssignTo(data,resultSet['assignTo'],obj.jwtToken);
				
				if(resultSet['addTag'])
					callToAddTag(data,resultSet['addTag'],obj.jwtToken);

				if(resultSet['archeiveConv'])
					callToArchieveConv(data,resultSet['archeiveConv'],obj.jwtToken);	
			
			});

		}
		else {
			var errorMessage = {};
			errorMessage.statusCode = 200;
			errorMessage.message = "No Rules found for this team.";
			res.status(200).send(errorMessage);
		}
	
	}).catch(function (err) {
		var errorMessage = {};
		errorMessage.statusCode = 501;
		errorMessage.message = err.message;
		res.status(501).send(errorMessage);
	});
}

exports.getRules = function(data,res, next,resFunc){
	if(Object.keys(data).length){
		var filter = {};
		filter.teamMemberEmail = res.locals.loggedInEmail;
		filter.teamEmail = data.teamEmail;
		filter.isActive = true;

		mongo.mongo_find(config.rulesCollection, filter).then(function (value) {
			res.send(value);
		});
	}
	else{
		var filter = {};
		filter.teamMemberEmail = res.locals.loggedInEmail;
		filter.isActive = true;

		mongo.mongo_find(config.rulesCollection, filter).then(function (value) {
			res.send(value);
		});
	}
}


function callToAssignTo(data,teamMateEmail,token){
	console.log(data.conversationId,data.teamEmail,teamMateEmail,token);
	// add to team.
    var teamOptions = { 
        
        method: 'POST',
        url: config.assignConvUrl + '/',
        
        headers: 
        { 'content-type': 'application/json', 
          'Authorization' : 'Bearer '+ token
    	},
        
        body: 
        { 
            teamMemberEmail: teamMateEmail,
            conversationId: data.conversationId,
            teamEmail: data.teamEmail 
        },
        
        json: true 
    };

    request(teamOptions, function (error2, response, body) {
      if (error2) throw new Error(error2);
        
        console.log(body);
    });
}

function callToAddTag(data,tagName,token){
			
	var teamOptions = { 
        
        method: 'POST',
        url: config.tagUrl + '/',
        
        headers: 
        { 'content-type': 'application/json', 
          'Authorization' : 'Bearer '+ token
    	},
        
        body: 
        {
        	tagName : tagName, 
            teamMemberEmail: "Automatic",
            conversationId: data.conversationId,
            teamEmail: data.teamEmail 
        },
        
        json: true 
    };

    request(teamOptions, function (error2, response, body) {
      if (error2) throw new Error(error2);
        
        console.log(body);
    });	
}

function callToArchieveConv(data,isArcheiveConv,token){
	
	var teamOptions = { 
        
        method: 'POST',
        url: config.archievConvUrl + '/',
        
        headers: 
        { 'content-type': 'application/json', 
          'Authorization' : 'Bearer '+ token
    	},
        
        body: 
        { 
            conversationId: data.conversationId,
            teamEmail: data.teamEmail 
        },
        
        json: true 
    };

    request(teamOptions, function (error2, response, body) {
      if (error2) throw new Error(error2);
        
        console.log(body);
    });
}