//exports.applicationUrl = "https://appmssharedauth.azurewebsites.net"
exports.applicationUrl = "http://localhost:3001"
//exports.clientId = "3e565261-afb5-4d60-bc72-7468fcab1d3d";
//exports.clientSecret = "fznCMS348)nafvDUCX66=_[";
exports.clientId = "12da4b34-4c78-45de-9f6e-ed5cf044e1a3";
exports.clientSecret = "xogvELDME52~*!@kswCA455";
exports.redirectUri = "http://localhost:3001/getAccessToken";
var microsoftLoginUrl = exports.microsoftLoginUrl = "login.microsoftonline.com";
var microsoftOAuthPart = exports.microsoftOAuthPart = '/common/oauth2/v2.0';
exports.microsoftOAuthUrl = microsoftLoginUrl + microsoftOAuthPart;
exports.scope = "offline_access user.read mail.read mail.read.shared mail.readwrite mail.readwrite.shared mail.send mail.send.shared mailboxsettings.read";
exports.graphApiUrl = "graph.microsoft.com";
exports.teamMemberCollectionName = 'teamMember';
exports.mongoConfig = 'mongodb://127.0.0.1/issuetrackerDB';
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamUrl = "http://localhost:3003";
exports.teamMemberUrl = "http://localhost:3004";
//exports.teamUrl = "https://smartinbox.azurewebsites.net";
//exports.teamMemberUrl = "http://smartinboxusers.azurewebsites.net";