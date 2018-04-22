exports.applicationUrl = "https://appmsauth.azurewebsites.net"
// exports.clientId = "a3c4c9e8-ffe1-42cc-9db9-b6c9afa367d6";
// exports.clientSecret = "tllytXUJ702);voOLBV91?@";
exports.clientId = "35136b25-e207-4806-a7c3-a3837b61cf31";
exports.clientSecret = "mkCZSM285~(pvcexAYE67}*";
//exports.redirectUri = "https://appmsauth.azurewebsites.net/getAccessToken";
exports.redirectUri = "http://localhost:3000/getAccessToken";
var microsoftLoginUrl = exports.microsoftLoginUrl = "login.microsoftonline.com";
var microsoftOAuthPart = exports.microsoftOAuthPart = '/common/oauth2/v2.0';
exports.microsoftOAuthUrl = microsoftLoginUrl + microsoftOAuthPart;
exports.scope = "offline_access user.read mail.read.shared mail.readwrite.shared mail.send.shared mailboxsettings.read";
exports.graphApiUrl = "https://graph.microsoft.com/v1.0";
exports.appSecret = '$/\\/\\@|~+|/\\/|30X';
exports.teamMateUrl = "http://localhost:3004";
exports.appAuthUrl = "http://localhost:3014";
exports.cookieDomain = '.azurewebsites.net';
