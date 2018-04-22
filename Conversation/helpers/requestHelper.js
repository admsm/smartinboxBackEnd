'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postData = postData;
exports.getData = getData;
exports.getRequest = getRequest;
exports.deleteData = deleteData;
var request = require("request");
var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var http = require('http');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = 'graph.microsoft.com';
var refreshTokenHost = "http://127.0.0.1:3001";
//var refreshTokenHost = 'appmssharedauth.azurewebsites.net';

/**
 * Generates a POST request (of Content-type ```application/json```)
 * @param {string} path the path, relative to the host, to which this request will be sent
 * @param {string} token the access token with which the request should be authenticated
 * @param {string} data the data which will be 'POST'ed
 * @param {callback} callback
 */
function postData(path, token, data) {
  var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'POST';
  var callback = arguments[4];

  var options = {
    host: host,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Length': data.length
    }
  };
  //  console.log(options);
  var req = _https2.default.request(options, function (res) {
    var subscriptionData = '';
    console.log(res.statusCode);
    res.on('data', function (chunk) {
      return subscriptionData += chunk;
    });
    res.on('end', function () {
      if (res.statusCode === 201 || res.statusCode === 200) callback(null, JSON.parse(subscriptionData));else callback(JSON.parse(subscriptionData), null);
    });
  });

  req.write(data);
  req.end();

  req.on('error', function (error) {
    return callback(error, null);
  });
}

/**
 * Generates a GET request (of Content-type ```application/json```)
 * @param {string} path the path, relative to the host, to which this request will be sent
 * @param {string} token the acess token with which the request should be authenticated
 * @param {callback} callback
 */
function getData(path, token, callback) {
  var options = {
    host: host,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;odata.metadata=minimal;' + 'odata.streaming=true;IEEE754Compatible=false',
      Authorization: 'Bearer ' + token
    }
  };

  var req = _https2.default.request(options, function (res) {
    var endpointData = '';

    res.on('data', function (chunk) {
      return endpointData += chunk;
    });
    res.on('end', function () {
      if (res.statusCode === 200) callback(null, JSON.parse(endpointData));else callback(JSON.parse(endpointData), null);
    });
  });

  req.write('');
  req.end();

  req.on('error', function (error) {
    return callback(error, null);
  });
}

function getRequest(email, callback) {

  var options = { method: 'GET',
  url: refreshTokenHost+'/getAccessToken',
  qs: { email: email } };

  request(options, function (error, response, body) {
    if (error) callback(error, null);
    else callback(null, JSON.parse(body));
  });
}

/**
 * Generates a DELETE request
 * @param {string} path the path, relative to the host, to which this request will be sent
 * @param {string} token the acess token with which the request should be authenticated
 * @param {callback} callback
 */
function deleteData(path, token, callback) {
  var options = {
    host: host,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-HTTP-Method': 'DELETE',
      Authorization: 'Bearer ' + token
    }
  };

  var req = _https2.default.request(options, function (res) {
    var endpointData = '';
    res.on('data', function (chunk) {
      return endpointData += chunk;
    });
    res.on('end', function () {
      return callback(null);
    });
  });

  req.end();

  req.on('error', function (error) {
    return callback(error);
  });
}