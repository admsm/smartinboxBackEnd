'use strict';

var _requestHelper = require('../helpers/requestHelper');

var _config = require('../config');

var redis = require('../helpers/redis');

exports.createSubscription = function (email, res, next,resultFunc) {
	redis.client.hgetall('user:' + email, function (err, obj) {
		if (err) {
			resultFunc('400', err.message);
		}

		var accessToken = obj.accessToken;
		//console.log(obj.accessToken);
		(0, _requestHelper.getRequest)('getAccessToken?email=' + email,obj.jwtToken, function (requestError, tokenInfo) {
			
			if (requestError && requestError.message) res.send(requestError.message);else if (requestError) res.send({ "message": "Error occured while getting the token", "status": "201" });
			//console.log(tokenInfo);
			accessToken = tokenInfo.access_token;
			_config.subscriptionConfiguration.expirationDateTime = new Date(Date.now() + 86400000 * 2).toISOString();

			(0, _requestHelper.postData)('/v1.0/subscriptions', accessToken, JSON.stringify(_config.subscriptionConfiguration), 'POST', function (requestError, subscriptionData) {

				if (requestError) {
					console.log(requestError);
					res.status(501).send(requestError.error.message);
				} else {
					redis.client.hmset(["user:" + email, "subscriptionId", subscriptionData.id], function (err, res) {});
					redis.client.set(["subscription:" + subscriptionData.id, email], function (err, res) {});
					res.status(200).send(subscriptionData);
				}
			});
		});
	});
};

exports.updateSubscription = function (email, resultFunc) {

	var subscriptionConfiguration = {};
	subscriptionConfiguration.expirationDateTime = new Date(Date.now() + 86400000 * 2).toISOString();

	redis.client.hgetall('user:' + email, function (err, obj) {
		if (err) {
			resultFunc('400', err.message);
		}
		var subscriptionId = obj.subscriptionId;
		var accessToken = obj.accessToken;

		if (obj.expirationTime < Date.now()) {
			(0, _requestHelper.getRequest)('getAccessToken?email=' + email,obj.jwtToken, function (requestError, tokenInfo) {
				if (requestError) console.log(requestError);

				accessToken = tokenInfo.accessToken;
			});
		}

		(0, _requestHelper.postData)('/v1.0/subscriptions/' + subscriptionId, accessToken, JSON.stringify(subscriptionConfiguration), 'PATCH', function (requestError, subscriptionData) {

			if (requestError) {
				resultFunc('500', requestError.error.message);
			}

			resultFunc('200', subscriptionData);
		});
	});
};