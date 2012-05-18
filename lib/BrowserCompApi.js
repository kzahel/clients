/*
* NEW BrowserCompAPI version 1.0.1.35
* The browser component api is made out of 5 parts (files):
* 1. BC_Base.js - containing few general use functions and objects, and the singelton BcApiObj
* 2. BC_Functions.js - containing Conduit exposed functions (e.g. users will only use these functions)
* 3. FF_and_IE_BC.js - containing FF and IE function implementation and objects
* 4. Chrome_BC.js - containing Chrome function implementation and objects
* 5. SmartBar_BC.js - containing SmartBar function implementation and objects
*/
// FF attach-api object
var BCAPI = (typeof BCAPIObject != "undefined")	? BCAPIObject : new Object();
//#region JSON for IE and FF 3.0
var JSON; JSON || (JSON = {});
(function() {
function k(a) { return a < 10 ? "0" + a : a } function o(a) { p.lastIndex = 0; return p.test(a) ? '"' + a.replace(p, function(a) { var c = r[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + a + '"' } function l(a, j) {
var c, d, h, m, g = e, f, b = j[a]; b && typeof b === "object" && typeof b.toJSON === "function" && (b = b.toJSON(a)); typeof i === "function" && (b = i.call(j, a, b)); switch (typeof b) {
case "string": return o(b); case "number": return isFinite(b) ? String(b) : "null"; case "boolean": case "null": return String(b); case "object": if (!b) return "null";
e += n; f = []; if (Object.prototype.toString.apply(b) === "[object Array]") { m = b.length; for (c = 0; c < m; c += 1) f[c] = l(c, b) || "null"; h = f.length === 0 ? "[]" : e ? "[\n" + e + f.join(",\n" + e) + "\n" + g + "]" : "[" + f.join(",") + "]"; e = g; return h } if (i && typeof i === "object") { m = i.length; for (c = 0; c < m; c += 1) typeof i[c] === "string" && (d = i[c], (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h)) } else for (d in b) Object.prototype.hasOwnProperty.call(b, d) && (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h); h = f.length === 0 ? "{}" : e ? "{\n" + e + f.join(",\n" + e) + "\n" + g + "}" : "{" + f.join(",") +
"}"; e = g; return h
}
} if (typeof Date.prototype.toJSON !== "function") Date.prototype.toJSON = function() { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + k(this.getUTCMonth() + 1) + "-" + k(this.getUTCDate()) + "T" + k(this.getUTCHours()) + ":" + k(this.getUTCMinutes()) + ":" + k(this.getUTCSeconds()) + "Z" : null }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() { return this.valueOf() }; var q = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
p = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, e, n, r = { "\u0008": "\\b", "\t": "\\t", "\n": "\\n", "\u000c": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, i; if (typeof JSON.stringify !== "function") JSON.stringify = function(a, j, c) {
var d; n = e = ""; if (typeof c === "number") for (d = 0; d < c; d += 1) n += " "; else typeof c === "string" && (n = c); if ((i = j) && typeof j !== "function" && (typeof j !== "object" || typeof j.length !== "number")) throw Error("JSON.stringify"); return l("",
{ "": a })
}; if (typeof JSON.parse !== "function") JSON.parse = function(a, e) {
function c(a, d) { var g, f, b = a[d]; if (b && typeof b === "object") for (g in b) Object.prototype.hasOwnProperty.call(b, g) && (f = c(b, g), f !== void 0 ? b[g] = f : delete b[g]); return e.call(a, d, b) } var d, a = String(a); q.lastIndex = 0; q.test(a) && (a = a.replace(q, function(a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) })); if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return d = eval("(" + a + ")"), typeof e === "function" ? c({ "": d }, "") : d; throw new SyntaxError("JSON.parse");
}
})();
var EBJSON = JSON; // some people still use EBJSON
function getContext(id) {
try {
var context;
if (typeof (abstractionlayer) !== 'undefined') {
var appMethods = abstractionlayer.commons.appMethods;
var windowName = appMethods.getTopParentWindowName && appMethods.getTopParentWindowName(this).result;
context = JSON.parse(appMethods.getContext(windowName || id).result);
}
else if (typeof (window.chrome) !== "undefined") {
var dirName = id.split("___")[1];  // get the chrome ext' id from window name
var keyName = 'gadgetsContextHash_';
var windowName = id;
var prePopup = 'popup_inner_iframe';
if (!document.getElementById("pluginObj")) {
document.write("<embed " + "id=\"pluginObj\" " + "type=\"ConduitChromeApi\"" + " style=\"height:0; visibility: hidden; position: fixed;\" " + "/>");
}
if (windowName && typeof windowName == 'string' && windowName.indexOf(prePopup) == 0) {
windowName = windowName.substr(prePopup.length);
}
var npapiplugin = document.getElementById("pluginObj");
if (npapiplugin && npapiplugin.getKey) {
existingValue = npapiplugin.getKey(dirName, keyName + windowName, false);
context = JSON.parse(existingValue) && JSON.parse(existingValue).result ? unescape(JSON.parse(existingValue).result) : '';
context = JSON.parse(context);
}
}
else if (typeof (window.safari) !== "undefined") {
var backHash = safari.extension.globalPage.contentWindow.conduit.abstractionlayer.commons.appMethods;
context = JSON.parse(backHash.getContext(id).result);
}
else {
context = JSON.parse(window.external.invokePlatformActionSync(23, 0, id));
if (context.result)
context = JSON.parse(context.result);
else {
context = null;
}
}
return context;
}
catch (e) {
return null;
}
}
//#endregion
//#region Legacy  - chrome and smartbar uses these
var ReturnValues =
{
info: {
browser: {
Firefox: "Firefox",
IE: "IE",
Safari: "SF"
},
context:
{
host:
{
toolbar: "Toolbar",
engine: "Engine"
}
}
},
returnCodes:
{
UNSUPPORTED: null,
errorInParameters: 3,
noPermissions: 2,
OK: 1
}
};
var UNSUPPORTED;
var _BCAPIHelper = {
callbacksHash: {},
returnCodes:
{
UNSUPPORTED: null,
NO_PERMISIONS: 2,
OK: 1
},
IEVersions: {
keyOverflowBlocking: "6.2.0.0"
},
isIE: function () {
return navigator.userAgent.indexOf("MSIE") != -1;
},
isFF: function () {
return navigator.userAgent.indexOf("Firefox") != -1;
},
// NOT GOOD. Don't USE THIS.
isSafari: function () {
return navigator.userAgent.indexOf("Safari") != -1;
},
isChrome: function () {
return navigator.userAgent.indexOf("Chrome") != -1;
},
stringFormat: function (strText) {
if (arguments.length <= 1) return strText;
var replaceString = "";
for (var i = 0; i < arguments.length - 1; i++) {
replaceString = "{" + i.toString() + "}";
strText = strText.replace(replaceString, arguments[i + 1]);
}
return strText;
},
getApiObj: function (strFuncName) {
SetLastError("");
//FF or Safari
if (BCAPI.storeKey) {
if (BCAPI[strFuncName])
return BCAPI;
else
//unsupported
return -1;
}
//Not new FF API or Safari
else {
//New IE API
try {
if (this.isIE() && window.external) {
if (window.external.isSupportedFunction(strFuncName))
return window.external;
else
//unsupported
return -1;
}
//old FF API
else
return null;
}
//old IE will return exception on "window.external"
catch (ex) {
return null;
}
}
},
GetUpgareUrl: function () {
return "http://hosting.conduit.com/upgrade/?ct=EB_TOOLBAR_ID";
},
GetToolbarUnknownCommandApiFuncUrl: function (strApiFunc) {
var strToolbarDomain = this.GetUpgareUrl();
return strToolbarDomain + "&apifunc=" + strApiFunc;
}
};
var myIsAllowNonPrivacy = true;
var myLastError = "";
function SetLastError(strError) {
if (typeof BCAPI.lastError != "undefined")
BCAPI.lastError = strError;
else
myLastError = strError;
};
function EBSetIsAllowNonPrivacyFunctions(strBool) {
//for IE
if (typeof strBool == "string") myIsAllowNonPrivacy = (strBool.toLowerCase() == "true") ? true : false;
// for FF
else myIsAllowNonPrivacy = strBool;
};
function compareVersions(strVer1, strMinVersion) {
var arrVer1 = strVer1.split(".");
var intVer1 = 0;
for (var i = arrVer1.length - 1; i >= 0; i--)
intVer1 += arrVer1[arrVer1.length - 1 - i] * (Math.pow(10, i));
if (arrVer1.length == 3) intVer1 = intVer1 * 10;
var arrVer2 = strMinVersion.split(".");
var intVer2 = 0;
for (var i = 0; i < arrVer2.length; i++)
intVer2 += arrVer2[arrVer2.length - 1 - i] * (Math.pow(10, i));
if (intVer1 < intVer2)
return false;
return true;
};
//#endregion
// The API singleton object. When the api is loaded to page this object will be created according to the environment.
var BcApiObj = function () {
var compatibleBcApi = {};
// CHANGED 9.9 - To check local storage for query string after redirect
///////if (/___requireStorage/.test(document.location.href) || typeof (abstractionlayer) !== "undefined") {// maybe use better if...
var myconduitAppData = typeof (localStorage) !== "undefined" ? localStorage.getItem("smartbarBcApi") : undefined;
function isNotSmartbar() {
var apiObj = _BCAPIHelper.getApiObj("getVersion");
if (apiObj == null) return false;
else if (apiObj != -1) {
if (parseInt(apiObj.getVersion().split('.')[0]) < 10)
return apiObj.getVersion();
else
return false
}
}
if (!isNotSmartbar() && navigator.userAgent.indexOf("Firefox") != -1 && (window != window.top) && !getContext(window.name) && typeof (abstractionlayer) === "undefined") {
var lastLoadNumber = localStorage.getItem("loadNumber");
lastLoadNumber = lastLoadNumber ? parseInt(lastLoadNumber) + 1 : 0
if (lastLoadNumber < 4) {
localStorage.setItem("loadNumber", lastLoadNumber);
document.location.reload();
}
else {
localStorage.removeItem("loadNumber");
}
}
else if (navigator.userAgent.indexOf("Firefox") != -1) {
localStorage.removeItem("loadNumber");
}
if (!isNotSmartbar() && (getContext(window.name) || /___requireStorage/.test(document.location.href) || myconduitAppData || typeof (abstractionlayer) !== "undefined")) {
compatibleBcApi = new SmartBar_BcApi();
}
else if (navigator.userAgent.indexOf("Firefox") != -1) {
compatibleBcApi = new FF_BcApi();
}
else if (navigator.userAgent.indexOf("MSIE") != -1) {
compatibleBcApi = new IE_BcApi();
}
else if (navigator.userAgent.indexOf("Chrome") != -1) {
compatibleBcApi = new Chrome_BcApi();
}
return compatibleBcApi;
} ();
function StoreKey(key, value) {
BcApiObj.StoreKey(key, value);
};
function RetrieveKey(key) {
return BcApiObj.RetrieveKey(key);
};
function DeleteKey(key) {
BcApiObj.DeleteKey(key);
};
function StoreGlobalKey(key, value) {
BcApiObj.StoreGlobalKey(key, value);
};
function RetrieveGlobalKey(key) {
return BcApiObj.RetrieveGlobalKey(key);
};
function DeleteGlobalKey(key) {
BcApiObj.DeleteGlobalKey(key);
};
function SelfNavigate(url, newSize) {
BcApiObj.SelfNavigate(url, newSize);
};
function ChangeWidth(newWidth) {
BcApiObj.ChangeWidth(newWidth);
};
function ChangeHeight(newHeight) {
BcApiObj.ChangeHeight(newHeight);
};
function ChangeSize(newWidth, newHeight) {
BcApiObj.ChangeSize(newWidth, newHeight);
};
function RefreshToolbar() {
BcApiObj.RefreshToolbar();
};
function EBOpenPopHtml(url, newWidth, newHeight) {
OpenFloatingWindow(url, newWidth, newHeight);
};
function OpenFloatingWindow(url, newWidth, newHeight) {
BcApiObj.OpenFloatingWindow(url, newWidth, newHeight);
};
function OpenGadget(url, width, height, features) {
BcApiObj.OpenGadget(url, width, height, features);
};
function CloseFloatingWindow() {
BcApiObj.CloseFloatingWindow();
};
function NavigateInMainFrame(strUrl) {
BcApiObj.NavigateInMainFrame(strUrl);
};
function GetMainFrameUrl() {//TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
return BcApiObj.GetMainFrameUrl();
};
function GetMainFrameTitle() {//TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
return BcApiObj.GetMainFrameTitle();
};
function GetCurrentHeight() {
return BcApiObj.GetCurrentHeight();
};
function GetCurrentWidth() {
return BcApiObj.GetCurrentWidth();
};
function GetSearchTerm() { //TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
return BcApiObj.GetSearchTerm();
};
function GetVersion() {
return BcApiObj.GetVersion();
};
function RefreshComponentById(strCompId) {
return BcApiObj.RefreshComponentById(strCompId);
};
function HandleHeight() {
BcApiObj.HandleHeight();
};
function GetToolbarId() {
return BcApiObj.GetToolbarId();
};
function GetToolbarName() {
return BcApiObj.GetToolbarName();
};
function GetDownloadPageUrl() {
return BcApiObj.GetDownloadPageUrl();
};
function GetInfo() {
return BcApiObj.GetInfo();
};
function SendNotification(notificationItem) {
if (notificationItem.sendAlert)
notificationItem.sendAlert();
};
//backwards compitability
function SendAlert(notificationItem) {
SendNotification(notificationItem);
}
function HtmlNotification(strTitle, logoUrl, strHtml, notificationLengthSeconds) {
return BcApiObj.HtmlNotification(strTitle, logoUrl, strHtml, notificationLengthSeconds);
};
function CustomNotification(strTitle, logoUrl, HtmlObj, notificationLengthSeconds) {
return BcApiObj.CustomNotification(strTitle, logoUrl, HtmlObj, notificationLengthSeconds);
};
var HtmlAlert = HtmlNotification;
function TextNotification(strTitle, logoUrl, strHeadline, strUrl, strLine1, strLine2, notificationLengthSeconds) {
return BcApiObj.TextNotification(strTitle, logoUrl, strHeadline, strUrl, strLine1, strLine2, notificationLengthSeconds);
};
var SimpleAlert = TextNotification;
function RegisterForMessaging(key) {
return BcApiObj.RegisterForMessaging(key);
};
function SendMessage(key, data) {
return BcApiObj.SendMessage(key, data);
};
function JSInjection(strScript, iTabId, bInjectToIframes) {
return BcApiObj.JSInjection(strScript, iTabId, bInjectToIframes);
};
function JSInjectionPermanent(strScript, bInjectToIframes) {
return BcApiObj.JSInjectionPermanent(strScript, bInjectToIframes);
};
function Header(name, value) {
this.toArray = function() {
return [name, value];
};
};
function CrossDomainHttpRequest(callback, method, url, postParams, userName, password, headersArr, isSingleCallback) {
return BcApiObj.CrossDomainHttpRequest(callback, method, url, postParams, userName, password, headersArr, isSingleCallback);
};
function GetLastError() {
return BcApiObj.LastError;
};
function AjaxResponse(hashKey, strData, httpCode, responseHeaders) {
_BCAPIHelper.callbacksHash[hashKey](strData, httpCode, responseHeaders);
delete _BCAPIHelper.callbacksHash[hashKey];
};
function GetAPIHostVersion() {
return BcApiObj.GetApiVersion();
};
function IsAppView() {
return BcApiObj.IsAppView();
};
function NavigateInFrame(url, targetFrame) {
return BcApiObj.NavigateInFrame(url, targetFrame);
};
function IsAppInstalled(guid) {
return BcApiObj.IsAppInstalled(guid);
};
function SetLinksTarget(target) {
return BcApiObj.SetLinksTarget(target);
};
function SetSkin(objParams) {
return BcApiObj.SetSkin(objParams);
};
function SaveFile(strFileName, strFileContent) {
return BcApiObj.SaveFile(strFileName, strFileContent);
};
function LoadFile(strFileName) {
return BcApiObj.LoadFile(strFileName);
};
function DeleteFile(strFileName) {
return BcApiObj.DeleteFile(strFileName);
};
function IsConduitApp() {
return BcApiObj.IsConduitApp();
};
function LaunchGadget(strUrl, width, height, features) {
return BcApiObj.LaunchGadget(strUrl, width, height, features);
};
function NavigateInNewTab(url) {
return BcApiObj.NavigateInNewTab(url);
};
function NavigateInTab(url, tabId) {
return BcApiObj.NavigateInTab(url, tabId);
};
function IsExtensionInstalled(guid, callback) {
return BcApiObj.IsExtensionInstalled(guid, callback);
};
function LaunchExternalProgram(exeAlias, params, notFoundLink) {
return BcApiObj.LaunchExternalProgram(exeAlias, params, notFoundLink);
};
function GetTranslation(key, callback) {
return BcApiObj.GetTranslation(key, callback);
};
function IsToolbarVisible(callback) {
return BcApiObj.IsToolbarVisible(callback);
};
function ExecuteScriptInFrame(frameId, script) {
return BcApiObj.ExecuteScriptInFrame(frameId, script);
};
function __GeneralResponse(hashKey, p1, p2, p3, p4, p5, p6) {
_BCAPIHelper.callbacksHash[hashKey](p1, p2, p3, p4, p5, p6);
delete _BCAPIHelper.callbacksHash[hashKey];
};
function Chrome_BcApi() {
API_NS = {};  // namespace
//#region API Helper Funcs
(function () {
API_NS.ApiHelperFunctions = new function () {
this.EB_DOCUMENT_COMPLETE_HANDLER = "DOMContentLoaded"; // Document event.
this.EB_NAVIGATE_COMPLETE_HANDLER = "load"; // Window event.
};
// aliases
var API = API_NS.ApiHelperFunctions;
// Trigger provider's EBDocumentComplete API event function
API.DOMContentLoaded = function () {
document.removeEventListener(this.EB_DOCUMENT_COMPLETE_HANDLER, API.DOMContentLoaded, false);
if (window.EBDocumentComplete) {
window.EBDocumentComplete(/*dataStruc.selectedTabUrl*/);
}
};
})();
//#endregion
var queryString = new function () {
/// <summary>Query string handler</summary>
var queryString = window.location.hash;
queryString = queryString.substr(queryString.indexOf('#') + 1);
if (queryString.length > 1) {
var queryStringParams = queryString.split('&');
for (var i = 0; i < queryStringParams.length; i++) {
var keyValue = queryStringParams[i].split('=');
this[keyValue[0]] = keyValue[1];
}
}
// Handling backward support for '#' / '?' change.
if (!queryString.isExtension && !queryString.isWebtoolbar && !queryString.uid) {
var queryString = window.location.search;
queryString = queryString.substr(queryString.indexOf('?') + 1);
if (queryString.length > 1) {
var queryStringParams = queryString.split('&');
for (var i = 0; i < queryStringParams.length; i++) {
var keyValue = queryStringParams[i].split('=');
this[keyValue[0]] = keyValue[1];
}
}
}
};
//#region AppInfo
(function () {
var WIN = "WIN";
var MAC = "MAC";
var LINUX = "LINUX";
API_NS.appInfo = new function () { };
var AppInfo = API_NS.appInfo;
AppInfo.getOS = function () {
try {
var strUserAgent = window.navigator.userAgent;
var iStart = strUserAgent.indexOf('(');
var iEnd = strUserAgent.indexOf(')');
var strPlatformData = strUserAgent.substring(iStart, iEnd);
var arrData = strPlatformData.split(';');
return arrData[2].replace(/\s/g, "");
}
catch (e) {
return "";
}
};
AppInfo.getOSName = function () {
try {
var strUserAgent = window.navigator.userAgent;
var iStart = strUserAgent.indexOf('(');
var iEnd = strUserAgent.indexOf(')');
var strPlatformData = strUserAgent.substring(iStart, iEnd);
var arrData = strPlatformData.split(';');
return arrData[0].replace(/\(/g, "");
}
catch (e) {
return "";
}
};
AppInfo.getOSVersion = function () {
return this.getOS().replace(/[a-zA-Z]/g, "");
};
AppInfo.getBrowserName = function () {
if (navigator.vendor.indexOf("Google") >= 0) {
return "chrome";
}
else {
return "safari";
}
};
AppInfo.getBrowserVersion = function () {
if (AppInfo.getBrowserName() == "chrome") {
var iStart = navigator.appVersion.indexOf("Chrome/") + 7;
var iEnd = navigator.appVersion.indexOf(" Safari/");
return navigator.appVersion.substring(iStart, iEnd);
}
else {
var iStart = navigator.appVersion.indexOf("Safari/") + 7;
return navigator.appVersion.substring(iStart);
}
};
})();
// #endregion
function ConduitChromeGadgetApi() {
function MessageData(messageType) {
this.messageType = messageType;
};
var sentMessageTypes = {
"gadgetReady": "GadgetApiReady",
"changeWidth": "changeWidth",
"changeHeight": "changeHeight",
"changeSize": "changeSize",
"selfNavigate": "selfNavigate",
"refreshApp": "refreshApp",
"navInMainFrame": "navInMainFrame",
"closeWindow": "closeWindow"
};
var receivedMessageTypes = {
"static": "static data",
"dynamic": "dynamic data",
"event": "event"
};
var eventTypes = {
"documentCompleted": "documentCompleted",
"navigateCompleted": "navigateCompleted",
"tabChanged": "tabChanged"
};
var mStaticData = null;
var mDynamicData = null;
var onEventReceived = function (eventType) {
switch (eventType) {
case eventTypes.tabChanged:
if (window.EBTabChange)
window.EBTabChange(objData.url);
break;
case eventTypes.documentCompleted:
if (window.EBDocumentComplete)
window.EBDocumentComplete(mDynamicData.mainFrameUrl);
break;
case eventTypes.navigateCompleted:
if (window.EBNavigateComplete)
window.EBNavigateComplete(mDynamicData.mainFrameUrl);
break;
default: break;
}
};
var onMessageReceived = function (event) {
var objData = EBJSON.parse(event.data);
if (!objData.messageType) return;
switch (objData.messageType) {
case receivedMessageTypes.dynamic:
mDynamicData = objData;
break;
case receivedMessageTypes.static:
mStaticData = objData;
break;
case receivedMessageTypes.event:
onEventReceived(objData.event);
break;
default: break;
}
};
var sendReadyMessage = function () {
var message = new MessageData(sentMessageTypes.gadgetReady);
window.top.postMessage(JSON.stringify(message), "*");
};
var registerForMessaging = function () {
window.addEventListener("message", onMessageReceived, false);
};
var init = function () {
sendReadyMessage();
registerForMessaging();
};
init();
//public functions
this.getMainFrameTitle = function () {
return mDynamicData.mainFrameTitle;
};
this.getMainFrameUrl = function () {
return mDynamicData.mainFrameUrl;
};
this.getWidth = function () {
if (mDynamicData)
return mDynamicData.width;
return null;
};
this.getHeight = function () {
return mDynamicData.height;
};
this.getVersion = function () {
return mStaticData.version;
};
this.getToolbarId = function () {
return mStaticData.toolbarId;
};
this.getToolbarName = function () {
return mStaticData.toolbarName;
};
this.getDownloadPageUrl = function () {
return mStaticData.downloadPageUrl;
};
//Chrome
this.changeWidth = function (width) {
var message = new MessageData(sentMessageTypes.changeWidth);
message.width = width;
window.top.postMessage(JSON.stringify(message), "*");
};
this.changeHeight = function (height) {
var message = new MessageData(sentMessageTypes.changeHeight);
message.height = height;
window.top.postMessage(JSON.stringify(message), "*");
};
this.changeSize = function (width, height) {
var message = new MessageData(sentMessageTypes.changeSize);
message.width = width;
message.height = height;
window.top.postMessage(JSON.stringify(message), "*");
};
//Chrome
this.storeKey = function (key, value) {
key += mStaticData.guid;
localStorage.setItem(key, value);
};
this.retrieveKey = function (key) {
key += mStaticData.guid;
return localStorage.getItem(key);
};
//Chrome
this.deleteKey = function (key) {
key += mStaticData.guid;
localStorage.removeItem(key);
};
//Chrome
this.storeGlobalKey = function (key, value) {
key += "_Global";
localStorage.setItem(key, value);
if (EBGlobalKeyChanged)
EBGlobalKeyChanged(key, value);
};
this.retrieveGlobalKey = function (key) {
key += "_Global";
return localStorage.getItem(key);
};
//Chrome
this.deleteGlobalKey = function (key) {
key += "_Global";
localStorage.removeItem(key);
};
this.selfNavigate = function (url, width) {
var message = new MessageData(sentMessageTypes.selfNavigate);
message.url = url;
message.width = width;
window.top.postMessage(JSON.stringify(message), "*");
};
this.refreshToolbar = function () {
var message = new MessageData(sentMessageTypes.refreshApp);
window.top.postMessage(JSON.stringify(message), "*");
};
this.navigateInMainFrame = function (url) {
var message = new MessageData(sentMessageTypes.navInMainFrame);
message.url = url;
window.top.postMessage(JSON.stringify(message), "*");
};
this.closeWindow = function () {
var message = new MessageData(sentMessageTypes.closeWindow);
window.top.postMessage(JSON.stringify(message), "*");
};
//Chrome
this.openGadget = function (url, width, height) {
this.changeSize(width, height);
this.selfNavigate(url);
};
this.openGadget2 = function (url, width, height) {
this.openGadget(url, width, height);
};
this.getApiVersion = function () {
return mStaticData.apiVersion;
};
//currently not implemented
this.getSearchTerm = function () { return ""; };
this.handleHeight = function () { };
this.refreshToolbar = function () { };
this.refreshComponentById = function () { };
};
//#endregion
function ConduitChromeWebtoolbarGadgetApi() {
var isChromeWebToolbarExtension = function () {
if (queryString.isExtension) {
return true;
}
return false;
};
var AppInfoService = API_NS.appInfo;
var dataStruc = {};
dataStruc.downloadPageUrl = '';
dataStruc.searchEngineString = '';
dataStruc.selectedTabTitle = '';
dataStruc.selectedTabUrl = unescape(queryString.mainFrameUrl); ;
dataStruc.currentWidth = 500;
dataStruc.currentHeight = 500;
dataStruc.toolbarName = '';
dataStruc.returnedSearchTerm = '';
dataStruc.toolbarInfo = {};
dataStruc.toolbarInfo.version = '';
dataStruc.toolbarInfo.originalCTID = '';
dataStruc.toolbarInfo.CTID = null;
dataStruc.toolbarInfo.isMulticommunity = false.toString();
dataStruc.toolbarInfo.isGrouping = false.toString();
this.registeredToolbarAPIMessages = [];
this.getInfo = function () {
var appInfo = {};
appInfo.general = {};
appInfo.context = {};
appInfo.size = {};
appInfo.appId = queryString.uid;
appInfo.size.width = dataStruc.currentWidth;
appInfo.size.height = dataStruc.currentHeight;
appInfo.context.host = ReturnValues.info.context.host.toolbar;
if (queryString.isHtmlCom) {
appInfo.context.embedLocation = "BrowserComponent";
} else
{ appInfo.context.embedLocation = "Gadget"; }
appInfo.general.OS = AppInfoService.getOSName();
appInfo.general.OSVersion = AppInfoService.getOSVersion();
appInfo.general.browser = AppInfoService.getBrowserName();
appInfo.general.browserVersion = AppInfoService.getBrowserVersion();
appInfo.general.toolbarName = dataStruc.toolbarName;
appInfo.general.toolbarVersion = this.getVersion(); //dataStruc.toolbarInfo.version;
return JSON.stringify(appInfo);
}
var createHiddenCommandDiv = function (commandData) {
HiddenCommandDiv = window.document.createElement("div");
HiddenCommandDiv.setAttribute("id", "HiddenCommandComponentDiv");
HiddenCommandDiv.setAttribute("style", "display:none");
HiddenCommandDiv.innerHTML = commandData;
if (document && document.body) {
document.body.appendChild(HiddenCommandDiv);
} else if (window && window.console) {
window.console.log("Trying to send BCAPI command before document body is ready at ", document && document.location ? document.location.href : " ? ",                         commandData);
}
};
var createReturnElement = function (divId) {
returnDataDiv = window.document.createElement("div");
returnDataDiv.setAttribute("id", divId);
returnDataDiv.setAttribute("style", "display:none");
document.body.appendChild(returnDataDiv);
return returnDataDiv;
};
var wasLocalKeySaved = function (key, value) {
if (window.EBKeyChanged) {
window.EBLocalKeyChanged(stripLocalKey(key), value);
}
};
var wasGlobalKeySaved = function (key, value) {
if (window.EBGlobalKeyChanged)
window.EBGlobalKeyChanged(stripGlobalKey(key), value);
};
this.onLoadFillDataStruc = function () {
var me = this;
var mini_me = this;
var functionName = "getOnLoadData";
var divReturnId = "returnOnLoadData";
this.localStore = window.localStorage;
//create div return element
var divReturnElement = createReturnElement(divReturnId);
//add listener to the div
divReturnElement.addEventListener('DOMSubtreeModified', function (me) {
var returnDiv = document.getElementById('returnOnLoadData');
var innerText = returnDiv.innerHTML;
var bodyElement = document.getElementsByTagName('body');
if (innerText.toString().length > 0) {
var objInnerText = JSON.parse(innerText);
//set dataStruc
if ('selectedTabTitle' in objInnerText) {
dataStruc.selectedTabTitle = objInnerText.selectedTabTitle;
}
if ('selectedTabUrl' in objInnerText) {
dataStruc.selectedTabUrl = objInnerText.selectedTabUrl;
}
if ('toolbarName' in objInnerText) {
dataStruc.toolbarName = objInnerText.toolbarName;
}
if ('returnedSearchTerm' in objInnerText) {
dataStruc.returnedSearchTerm = objInnerText.returnedSearchTerm;
}
if ('height' in objInnerText) {
dataStruc.currentHeight = objInnerText.height;
}
if ('width' in objInnerText) {
dataStruc.currentWidth = objInnerText.width;
}
if ('returnedToolbarInfo' in objInnerText) {
dataStruc.toolbarInfo.version = objInnerText.version;
dataStruc.toolbarInfo.originalCTID = objInnerText.originalCTID;
dataStruc.toolbarInfo.CTID = objInnerText.CTID;
}
if ('reCallOnLoad' in objInnerText) {
BCAPI.onLoadFillDataStruc();
}
if ('wasLocalKeySaved' in objInnerText) {
wasLocalKeySaved(objInnerText.propName, objInnerText.propValue);
}
if ('wasGlobalKeySaved' in objInnerText) {
wasGlobalKeySaved(objInnerText.propName, objInnerText.propValue);
}
if ('wasSearchTermEntered' in objInnerText) {
SendEBSearchTermChanged(objInnerText.searchTerm);
}
if ('downloadPageUrl' in objInnerText) {
dataStruc.downloadPageUrl = objInnerText.downloadPageUrl;
}
if ('wasCrossDomainHTTPRequestDataReturned' in objInnerText) {
wasCrossDomainHTTPRequestDataReturned(objInnerText.response, objInnerText.hashKey, objInnerText.httpReturnCode, objInnerText.responseHeaders);
}
if ('wasSelectedTabChanged' in objInnerText) {
wasSelectedTabChanged(objInnerText.selectedTabUrl);
}
if ('searchEngineString' in objInnerText) {
dataStruc.searchEngineString = objInnerText.searchEngineString;
}
if ('sendMessageDataReceived' in objInnerText) {
BCAPI.receivedMessageFromToolbarAPI(objInnerText.key, objInnerText.message);
}
// returnDiv.innerHTML = '';
}
}, false);
if (queryString.width) {
dataStruc.currentWidth = queryString.width
}
if (queryString.height) {
dataStruc.currentHeight = queryString.height;
}
createHiddenCommandDiv(functionName);
refreshGlobalKeys();
checkIfSearchWasMade();
setTargetsLinksForHashes();
removeExtraQueryStringHash();
if (window.EBNavigateComplete) {
window.EBNavigateComplete(/*dataStruc.selectedTabUrl*/);
}
};
this.getToolbarId = function () {
return dataStruc.toolbarInfo.CTID;
};
this.isConduitApp = function () {
// If dataStruc.toolbarInfo.CTID was changed from null via a message from the Toolbar - returning true. Else -
// either we're before the load event or the toolbar isn't running.
return (dataStruc.toolbarInfo.CTID != null);
};
this.getVersion = function () {
return dataStruc.toolbarInfo.version;
};
this.changeWidth = function (width) {
dataStruc.currentWidth = width;
var functionName = "GadgetChangeWidth";
var uid = queryString.uid;
createHiddenCommandDiv(functionName + ";" + uid + ";" + width);
dataStruc.currentWidth = width;
var functionName = "ComponentChangeWidth";
var uid = queryString.uid;
createHiddenCommandDiv(functionName + ";" + uid + ";" + width);
};
this.changeHeight = function (height) {
dataStruc.currentHeight = height;
var functionName = "GadgetChangeHeight";
var uid = queryString.uid;
createHiddenCommandDiv(functionName + ";" + uid + ";" + height);
};
// An empty func. just so 'upgrade toolbar' isn't shown.
this.handleHeight = function () {
};
this.changeSize = function (width, height) {
//web toolbar
dataStruc.currentWidth = width;
dataStruc.currentHeight = height;
var uid = queryString.uid;
var functionName = "GadgetChangeSize";
createHiddenCommandDiv(functionName + ";" + uid + ";" + width + ";" + height);
};
var removeOnClickEventHandlerIfExists = function (link) {
var startOfString = /^window.open\(\'/;
var linkOnClickAttr = link.getAttribute ? link.getAttribute('onclick') : null;
if (linkOnClickAttr && startOfString.test(linkOnClickAttr)) {
link.setAttribute('onclick', '');
}
}
var setLinkToOpenInNewWindow = function (link) {
var windowOpenStr = "window.open('";
windowOpenStr += link.getAttribute('href') + "', '', 'location=1,fullscreen=1,menubar=1,resizable=1,status=yes'); return !1;";
//windowOpenStr += link.getAttribute('href') + "', '', 'location=1,menubar=1,resizable=1,status=yes'); return !1;";
var onClickStr = link.getAttribute('onclick');
if (!onClickStr || onClickStr == '') {
link.setAttribute('onclick', windowOpenStr);
}
else { // Concating window.open string to existing onclick handler.
link.setAttribute('onclick', onClickStr + ';' + windowOpenStr);
}
};
var setLinkToOpenSearch = function (link) {
defaultSearchEngineString = dataStruc.searchEngineString ? dataStruc.searchEngineString : "http://www.google.com/#q={0}";
defaultSearchEngineString = _BCAPIHelper.stringFormat(defaultSearchEngineString, link);
var windowOpenStr = "window.open('" + defaultSearchEngineString + "', '', 'fullscreen=1,menubar=1,resizable=1,toolbar=1,status=yes'); return !1;";
if (!link.getAttribute('onclick') || link.getAttribute('onclick') == '') {
link.setAttribute('onclick', windowOpenStr);
}
};
this.setLinksTarget = function (target) {
var allHREFTags = document.getElementsByTagName('a');
for (var i = 0; i < allHREFTags.length; i++) {
setLinkAttribute(allHREFTags[i], target);
}
};
this.navigateInFrame = function (url, targetIframe) {
var functionName = "navigateInFrame";
createHiddenCommandDiv(functionName + ";" + url + ";" + targetIframe);
};
this.navigateInNewTab = function (url) {
var functionName = "navigateInNewTab";
createHiddenCommandDiv(functionName + ";" + queryString.uid + ';' + url);
}
this.navigateInMainFrame = function (url) {
var helpUrl = url.toLowerCase();
if (helpUrl.indexOf('http://') != 0 && helpUrl.indexOf('https://') != 0 && helpUrl.indexOf('file://') != 0 && helpUrl.indexOf('ftp://') != 0) {
url = 'http://' + url;
}
window.open(url, '_top', 'menubar=1,resizable=1,status=yes');
};
// Called every window.load. Removes anything after the second hash (which is appeneded by us) so any publisher anchor still works.
var removeExtraQueryStringHash = function () {
if (window.location && window.location.href) {
var href = window.location.href.split("#");
// Leaving only first part of url + the section between first and second hash.
if (href[2] && href[1] && href[0]) {
window.location.href = href[0] + '#' + href[1];
}
}
};
// Called every window.load. Sets targets for any link on the page which contains a target after a hash symbol in it's href.
var setTargetsLinksForHashes = function () {
var allHREFTags = document.getElementsByTagName('a');
for (var i = 0; i < allHREFTags.length; i++) {
setTargetLinkForALinkWithAHashChar(allHREFTags[i]);
}
};
// Sets the target for a link which contains a target after a hash symbol in it's href.
var setTargetLinkForALinkWithAHashChar = function (link) {
var href = (link && link.getAttribute ? link.getAttribute('href') : '');
if (href && href !== '') {
// Finding the string at the end, after the hash char, which should contain the target (i.e., _top etc.).
var reggie = new RegExp('\#.*$');
var reggieRes = reggie.exec(href);
var afterHashString = reggieRes ? reggieRes.toString() : null;
if (afterHashString && afterHashString != '') {
// Removing the hash char. and anything trailing a '?' char. TODO: unify Regexp.
var target = afterHashString.replace(/^\#/, "").replace(/\?.*/, "");
if (target && target !== '') {
setLinkAttribute(link, target);
}
}
}
};
// Sets one HTML link's onclick / target attribute so that it opens in same tab / new tab etc.
var setLinkAttribute = function (link, target) {
if (link && link.setAttribute) {
switch (target) {
case ('_new'):
setLinkToOpenInNewWindow(link);
break;
case ('_search'):
setLinkToOpenSearch(link);
break;
case ('_parent'):
case ('_main'):
case ('_top'):
removeOnClickEventHandlerIfExists(link);
link.setAttribute('target', '_top');
break;
// _top - open in current tab. _self - open inside current iframe _blank - open inside new tab.
case ('_tab'):
case ('_blank'):
removeOnClickEventHandlerIfExists(link);
link.setAttribute('target', '_blank');
break;
case ('_self'):
removeOnClickEventHandlerIfExists(link);
link.setAttribute('target', '_self');
break;
default: break;
}
}
else {
//console.log("SetTargetsLink: Can not set attribute for link : ", link);
}
}
this.getDownloadPageUrl = function () {
return dataStruc.downloadPageUrl;
};
this.getMainFrameTitle = function () {
return dataStruc.selectedTabTitle;
};
this.getToolbarName = function () {
return dataStruc.toolbarName;
};
this.getMainFrameUrl = function () {
return dataStruc.selectedTabUrl;
};
this.getWidth = function () {
if (dataStruc)
return dataStruc.currentWidth;
return null;
};
this.getHeight = function () {
return dataStruc.currentHeight;
};
this.refreshToolbar = function () {
var functionName = "refreshToolbar";
createHiddenCommandDiv(functionName + ";" + dataStruc.toolbarInfo.CTID);
};
this.closeWindow = function () {
//chrome toolbar (realcommerce)
var uid = queryString.uid;
var functionName = "GadgetCloseWindow";
createHiddenCommandDiv(functionName + ";" + uid);
};
//#region my helper functions
var setGlobalKey = function (key) {
key = "_GLOBAL_" + key;
return key;
};
var setLocalKey = function (key) {
var keyPostFix = (queryString && queryString.uid ? queryString.uid : "");
key = "_LOCAL_" + key + "_" + keyPostFix;
return key;
};
var stripGlobalKey = function (key) {
if (key && typeof (key) == 'string') {
key = key.replace(/^_GLOBAL_/, "");
}
return key;
}
var stripLocalKey = function (key) {
if (key && typeof (key) == 'string') {
key = key.replace(/^_LOCAL_/, "");
}
return key;
}
// Store a key value pair in the window localStorage
var storeObject = function (key, value) {
try {
var jsonString = null;
if (value) {
jsonString = JSON.stringify(value)
if (jsonString)
localStorage.setItem(key, jsonString);
}
}
catch (e) { }
};
var retrieveObject = function (key) {
var value = null;
var objectValueFromJSON = null;
try {
if (key) {
value = localStorage.getItem(key);
if (value) {
objectValueFromJSON = JSON.parse(value);
}
}
}
catch (e) { }
return (value && objectValueFromJSON);
};
var removeObject = function (key) {
var value = retrieveObject(key);
if (!value) return;
try {
localStorage.removeItem(key);
} catch (e) { }
};
// A function that gets a string and replaces all occurrences of one string in another
var replaceAll = function (str, stringToFind, stringToReplace) {
var temp = str;
var index = temp.indexOf(stringToFind);
while (index != -1) {
temp = temp.replace(stringToFind, stringToReplace);
index = temp.indexOf(stringToFind);
}
return temp;
}
// This is for detecting the mouse coordinates.
// This is for openGadget - openPosition (Click)
var lastMouseMoveCoordinates = {
"x": 0,
"y": 0
};
// Stores the mouse coordinates
var updateLastMouseMoveCoordinates = function (e) {
lastMouseMoveCoordinates.x = e.pageX;
lastMouseMoveCoordinates.y = e.pageY;
};
document.addEventListener("mousemove", updateLastMouseMoveCoordinates, false);
//#endregion
// local key storage
this.storeKey = function (key, value) {
var functionName = "storeKey";
key = setLocalKey(key);
storeObject(key, value);
createHiddenCommandDiv(functionName + ";" + key + ";" + value);
};
this.retrieveKey = function (key) {
return (retrieveObject(setLocalKey(key)));
};
this.deleteKey = function (key) {
var functionName = "deleteKey";
key = setLocalKey(key);
removeObject(key);
createHiddenCommandDiv(functionName + ";" + key);
};
// global key storage
this.storeGlobalKey = function (key, value) {
var functionName = "storeGlobalKey";
key = setGlobalKey(key)
storeObject(key, value); // Storing in local window's storage.
createHiddenCommandDiv(functionName + ";" + key + ";" + value); // Sending message to view to send to bg controller to store in bg storage.
};
var refreshGlobalKeys = function () {
var functionName = "refreshGlobalKeysFromBg";
createHiddenCommandDiv(functionName);
};
this.retrieveGlobalKey = function (key) {
return (retrieveObject(setGlobalKey(key)));
};
this.deleteGlobalKey = function (key) {
var functionName = "deleteGlobalKey";
key = setGlobalKey(key);
removeObject(key);
createHiddenCommandDiv(functionName + ";" + key);
};
// Search Term checking on startup (since search is opened in same page).
var checkIfSearchWasMade = function () {
var functionName = "wasSearchTermEntered";
createHiddenCommandDiv(functionName);
};
var wasCrossDomainHTTPRequestDataReturned = function (response, hashKey, httpReturnCode, responseHeaders) {
if (_BCAPIHelper && !isNaN(parseInt(hashKey)) && _BCAPIHelper.callbacksHash[parseInt(hashKey)]) {
// Creating a temp. element in the HTML so we can use the browser's natural parser to get rid of any special escape chars.
// TODO: Check security implications.
function decodeEntities(str) {
var tmpElementName = 'BCAPI_wasCrossDomainHTTPRequestDataReturned_BCAPI';
var tmpElement = document.getElementById(tmpElementName);
if (!tmpElement) {
tmpElement = document.createElement('div');
tmpElement.setAttribute('id', 'parserElement');
tmpElement.setAttribute('display', 'none');
}
tmpElement.innerHTML = str;
var retStr = tmpElement.textContent || tmpElement.innerText;
tmpElement.innerHTML = ''; // Cleaning up element
tmpElement = null;
return retStr;
}
_BCAPIHelper.callbacksHash[hashKey](decodeEntities(response), httpReturnCode, unescape(responseHeaders));
}
};
// Search term changed notification
var SendEBSearchTermChanged = function (term) {
if (window.EBSearchTermChanged)
window.EBSearchTermChanged(term);
};
// Tab was changed
var wasSelectedTabChanged = function (selectedTabUrl) {
if (window.EBTabChange) {
window.EBTabChange(selectedTabUrl);
}
};
this.getSearchTerm = function () {
return dataStruc.returnedSearchTerm;
};
// Sends a message to the ToolbarApi
this.sendMessage = function (key, message) {
var uid = queryString.uid;
var functionName = "sendToolbarAPIMessageFromBCAPI";
var sendMessageEvent = {
'name': 'sendMessage',
'data': {
'key': key,
'data': message
},
'targetAPI': 'ToolbarApi',
'sourceAPI': 'BcApi',
'sourceID': uid
};
createHiddenCommandDiv(functionName + ";" + sendMessageEvent.name + ";" + sendMessageEvent.data.key + ";" + sendMessageEvent.data.data + ";" + sendMessageEvent.targetAPI + ";" + sendMessageEvent.sourceAPI + ";" + sendMessageEvent.sourceID);
}
this.openGadget = function (url, width, height) {
var functionName = "ComponentOpenGadget";
var uid = queryString.uid;
if (queryString.top) {
var top = queryString.top;
}
else {
var top = "";
}
if (queryString.left) {
var left = queryString.left;
}
else {
var left = "";
}
createHiddenCommandDiv(functionName + ";" + uid + ";" + url + ";" + width + ";" + height + ";" + top + ";" + left + ';' + window.location);
}
this.crossDomainHttpRequest = function (hashKey, method, url, postParams, userName, password, strJsonHeaders) {
createHiddenCommandDiv("crossDomainHttpRequestFromAPI" + ";" + hashKey + ";" + method + ";" + url + ";" + postParams + ";" + userName + ";" + password + ";" + strJsonHeaders);
};
this.injectScript = function (scriptText) {
function isHttps() {
var mainFrameUrl = '';
if (typeof this.GetMainFrameUrl === 'function') {
mainFrameUrl = this.GetMainFrameUrl();
}
return !mainFrameUrl || (typeof mainFrameUrl === 'string') && (mainFrameUrl.match(/^https\:\/\//i));
}
try {
if (~scriptText.indexOf("toolbarapi.js")) {
// If we don't have the mainFrameURL yet or We're inside an https page -
// switching the http://...toolbarapi references to https.
if (isHttps()) {
scriptText = scriptText.replace(/http\:\/\/api\.conduit\.com\/toolbarapi\.js/ig, "https://api.conduit.com/toolbarapi.js");
}
}
if (~scriptText.indexOf("EBCallBackMessageReceived(")) {
var params = scriptText.match(/EBCallBackMessageReceived\((.*?)\)/);
var myKey = '';
var myData = '';
if (params && params.length > 1) {
params = params[1];
params = params.split(',');
if (params[0]) {
myKey = params[0];
if (params.length > 1 && params[1]) {
myData = params[1];
}
}
}
var newScriptText = scriptText;
var toolbarApiSrc = (isHttps() ? 'https' : 'http') +'://api.conduit.com/ToolbarApi.js'
var appendToolbarApi = [
"if (typeof(TPI) === 'undefined'){ ",
"(function(){ ",
"var scr = document.createElement('script'); ",
"scr.setAttribute('src', '" + toolbarApiSrc + "'); ",
"document.head.appendChild(scr); ",
" })();",
" }",
"if (typeof window.EBCallBackMessageReceived === 'undefined') {function EBCallBackMessageReceived(key, data){ };}",
"else {try {var sendMessageEvent = {",
"'name': 'sendMessage',",
"'data': {key:",
myKey,
/*",",
"data:",
myData,
//"'",*/
"},",
"'sourceAPI': 'ToolbarApi',",
"'targetAPI': 'BcApi'",
"};",
"if (document && document.location && document.location.href.toUpperCase().indexOf('FACEBOOK.COM') === -1) {",
"window.postMessage(JSON.stringify(sendMessageEvent), '*'); }} catch(e) { console.error('BCAPI ERROR: ', e, e.stack);}}"
].join("");
scriptText = newScriptText.replace(/EBCallBackMessageReceived\((.*?)\)/g, appendToolbarApi);
}
var currVersion = this.getVersion();
var supportsOneCommand = {
firstSenario: {
maxVersion: [2, 3, 0, 12]
},
secondSenario: {
minVersion: [2, 4, 0, 1],
maxVersion: [2, 4, 0, 12]
}
};
var supportsMultiCommands = {
firstSenario: {
minVersion: [2, 3, 0, 13],
maxVersion: [2, 4, 0, 0]
},
secondSenario: {
minVersion: [2, 4, 0, 13]
}
};
if (typeof (currVersion) != "string") {
currVersion = supportsMultiCommands.firstSenario.minVersion;
}
else if (typeof (currVersion) == "string") {
currVersion = currVersion.split(".");
if (currVersion.length < 4)
currVersion = supportsMultiCommands.firstSenario.minVersion;
}
var outOfRange = false;
if (supportsMultiCommands.firstSenario.minVersion[0] >= parseInt(currVersion[0], 10)) {
if (supportsMultiCommands.firstSenario.minVersion[0] > parseInt(currVersion[0], 10))
outOfRange = true;
if (supportsMultiCommands.firstSenario.minVersion[1] >= parseInt(currVersion[1], 10)) {
if (supportsMultiCommands.firstSenario.minVersion[1] > parseInt(currVersion[1], 10))
outOfRange = true;
if (supportsMultiCommands.firstSenario.minVersion[2] >= parseInt(currVersion[2], 10)) {
if (supportsMultiCommands.firstSenario.minVersion[2] > parseInt(currVersion[2], 10))
outOfRange = true;
if (supportsMultiCommands.firstSenario.minVersion[3] > parseInt(currVersion[3], 10)) {
outOfRange = true;
}
}
}
}
if (!outOfRange && supportsMultiCommands.secondSenario.minVersion[0] == parseInt(currVersion[0], 10) && supportsMultiCommands.secondSenario.minVersion[1] == parseInt(currVersion[1], 10)
&& supportsMultiCommands.secondSenario.minVersion[2] == parseInt(currVersion[2], 10) && supportsMultiCommands.firstSenario.maxVersion[3] <= parseInt(currVersion[3], 10) && supportsMultiCommands.secondSenario.minVersion[3] > parseInt(currVersion[3], 10)) {
outOfRange = true;
}
if (!outOfRange)
scriptText = scriptText.replace(/;/g, "___BCAPI_JS_INJECTION");
scriptText = scriptText.replace(/\</g, "&lt;");
scriptText = scriptText.replace(/\>/g, "&gt;");
createHiddenCommandDiv("injectJSScript" + ";" + scriptText + ";" + queryString.uid);
}
catch (generalException) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
};
this.selfNavigate = function (url, width) {
var uid = queryString.uid;
var functionName = "selfNavigate";
createHiddenCommandDiv(functionName + ";" + uid + ";" + url + ";" + width);
};
this.openGadget2 = function (url, width, height, features) {
var functionName = "ComponentOpenGadget";
var uid = queryString.uid;
if (queryString.top) {
var top = queryString.top;
}
else {
var top = "";
}
if (queryString.left) {
var left = queryString.left;
}
else {
var left = "";
}
// Features can contain the char ';' so it needs to be replaced
features = replaceAll(features, ";", "^");
createHiddenCommandDiv(functionName + ";" + uid + ";" + url + ";" + width + ";" + height + ";" + top + ";" + left + ";" + lastMouseMoveCoordinates.x + ";" + lastMouseMoveCoordinates.y + ";" + features + ';' + window.location);
};
this.openGadget3 = function (url, width, height, features) {
this.openGadget2(url, width, height, features);
};
this.getApiVersion = function () {
return "2.3";
};
this.refreshComponentById = function (strCompID) {
var functionName = "refreshCompById";
createHiddenCommandDiv(functionName + ";" + strCompID);
};
this.sendInstantAlertByHtml2 = function (strTitle, logoUrl, xmlHtml, notificationLengthSeconds, strUrl) {
var htmlObj
try {
htmlObj = JSON.parse(xmlHtml);
} catch (e) { }
if (typeof (htmlObj) === 'object') {
xmlHtml = htmlObj;
this.sendInstantAlertByHtml3.apply(this, arguments);
return;
}
var myHtml = escape(xmlHtml);
var functionName = "showAPIAlert";
var uid = queryString.uid;
if (!strUrl) {
strUrl = '';
}
createHiddenCommandDiv(functionName + ";" + uid + ";" + strTitle + ";" + logoUrl + ";" + myHtml + ";" + notificationLengthSeconds + ";" + strUrl);
}
this.sendInstantAlertByHtml3 = function (strTitle, logoUrl, htmlObj, notificationLengthSeconds) {
var functionName = "showAPIAlertFromURL";
var strUrl = htmlObj.content.url;
var uid = queryString.uid;
if (!strUrl) {
strUrl = '';
}
createHiddenCommandDiv(functionName + ";" + strUrl + ";" + uid);
}
this.registerForMessaging = function (key) {
this.registeredToolbarAPIMessages.push(key);
}
this.receivedMessageFromToolbarAPI = function (key, message) {
if (window.EBMessageReceived && this.registeredToolbarAPIMessages.indexOf(key) != -1)
window.EBMessageReceived(key, message);
if (typeof window.EBCallBackMessageReceived === 'function') {
EBCallBackMessageReceived(key, message);
}
};
//listen to changes in HiddenReturedDataDiv
this.listener = function (HiddenReturedDataDivText) {
if (HiddenReturedDataDivText != "") {
this.getDataFromInputHidden(HiddenReturedDataDivText);
}
};
this.getDataFromHiddenReturedDataDiv = function (HiddenReturedDataDivText) {
if (HiddenReturedDataDivText) {
var arrayValue = HiddenReturedDataDivText.split(';');
}
var eventData = null;
var eventName = null;
var isLegalEventType = true;
switch (arrayValue[0]) {
case ("getInfo"):
break;
default:
break;
}
};
};
function isChromeWebToolbarExtensionAsync(callback) {
if (navigator.userAgent.indexOf("Chrome") != -1) {
var isFound = false;
if (queryString.isExtension || queryString.chromeExtension || document.getElementById('isChromeWebToolbarDiv') != null) {
isFound = true;
callback(true);
}
document.addEventListener("DOMNodeInserted", function (e) {
if (e.target.tagName && e.target.tagName.toLowerCase() == "div" && e.target.id == "isChromeWebToolbarDiv") {
isFound = true;
callback(true);
}
}, false);
window.addEventListener("load", function (e) {
if (isFound) return;
callback(false);
}, true);
}
else
callback(false);
};
var callback = function (isWebToolbar) {
if (isWebToolbar) {
var API = API_NS.ApiHelperFunctions;
if (!(BCAPI instanceof ConduitChromeWebtoolbarGadgetApi)) {
BCAPI = new ConduitChromeWebtoolbarGadgetApi();
}
window.addEventListener("load", function () { BCAPI.onLoadFillDataStruc(); }, false);
// Adding Event listeners to send EB event notifications whenever document content loaded event is triggered.
document.addEventListener(API.EB_DOCUMENT_COMPLETE_HANDLER, API.DOMContentLoaded, false);
}
else
BCAPI = new ConduitChromeGadgetApi();
var communicator = BCAPI;
communicator.isSupportedFunction = function (functionName) {
return (communicator[functionName])
}
BcApiObj = new BcApi(communicator);
};
isChromeWebToolbarExtensionAsync(callback);
// We do this to avoid exceptions until BCAPI is loaded
var communicator = BCAPI;
communicator.isSupportedFunction = function (functionName) {
if (BCAPI.storeKey && !communicator.storeKey) {
communicator = BCAPI;
communicator.isSupportedFunction = function (functionName) { return (communicator[functionName]) }
BcApiObj.setCommunicator(communicator);
}
return (communicator[functionName])
}
BcApi.call(this, communicator);
}
Chrome_BcApi.prototype = new BcApi();
Chrome_BcApi.constructor = Chrome_BcApi;
//end
/* FF and IE parent object, most API functions are implemented here
* communicator - the object used to communicate with toolbar
*/
function BcApi(communicator) {
if (!communicator) return;
var communicate = communicator;
this.setCommunicator = function (communicator) {
communicate = communicator;
}
this.StoreKey = function (key, value) {
if (communicate.isSupportedFunction("storeKey"))
communicate.storeKey(key, value);
else
return UNSUPPORTED;
};
this.RetrieveKey = function (key) {
if (communicate.isSupportedFunction("retrieveKey"))
return communicate.retrieveKey(key);
else
return UNSUPPORTED;
};
this.DeleteKey = function (key) {
if (communicate.isSupportedFunction("deleteKey"))
communicate.deleteKey(key);
else
return UNSUPPORTED;
};
this.StoreGlobalKey = function (key, value) {
if (communicate.isSupportedFunction("storeGlobalKey"))
communicate.storeGlobalKey(key, value);
else
return UNSUPPORTED;
};
this.RetrieveGlobalKey = function (key) {
if (communicate.isSupportedFunction("retrieveGlobalKey"))
return communicate.retrieveGlobalKey(key);
else
return UNSUPPORTED;
};
this.DeleteGlobalKey = function (key) {
if (communicate.isSupportedFunction("deleteGlobalKey"))
communicate.deleteGlobalKey(key);
else
return UNSUPPORTED;
};
this.SelfNavigate = function (url, newSize) {
if (typeof (newSize) == 'undefined') newSize = -1;
if (communicate.isSupportedFunction("selfNavigate"))
communicate.selfNavigate(url, newSize);
else
return UNSUPPORTED;
};
this.ChangeWidth = function (newWidth) {
if (communicate.isSupportedFunction("changeWidth"))
communicate.changeWidth(newWidth);
else
return UNSUPPORTED;
};
this.ChangeHeight = function (newHeight) {
if (communicate.isSupportedFunction("changeHeight"))
communicate.changeHeight(newHeight);
else
return UNSUPPORTED;
};
this.ChangeSize = function (newWidth, newHeight) {
if (communicate.isSupportedFunction("changeSize"))
communicate.changeSize(newWidth, newHeight);
else
return UNSUPPORTED;
};
this.RefreshToolbar = function () {
if (communicate.isSupportedFunction("refreshToolbar"))
communicate.refreshToolbar();
else
return UNSUPPORTED;
};
this.OpenFloatingWindow = function (url, newWidth, newHeight) {
if (communicate.isSupportedFunction("openGadget"))
communicate.openGadget(url, newWidth, newHeight);
else
this.OpenGadget(url, newWidth, newHeight);
};
this.OpenGadget = function (url, width, height, features) {
if (!features) features = "";
if (communicate.isSupportedFunction("openGadget2"))
communicate.openGadget2(url, width, height, features);
else
return UNSUPPORTED;
};
this.CloseFloatingWindow = function () {
if (communicate.isSupportedFunction("closeWindow"))
communicate.closeWindow();
else
return UNSUPPORTED;
};
this.NavigateInMainFrame = function (strUrl) {
if (communicate.isSupportedFunction("navigateInMainFrame"))
communicate.navigateInMainFrame(strUrl);
else
return UNSUPPORTED;
};
this.GetMainFrameUrl = function () {//TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
if (communicate.isSupportedFunction("getMainFrameUrl"))
return communicate.getMainFrameUrl();
else
return UNSUPPORTED;
};
this.GetMainFrameTitle = function () {//TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
if (communicate.isSupportedFunction("getMainFrameTitle"))
return communicate.getMainFrameTitle();
else
return UNSUPPORTED;
};
this.GetCurrentHeight = function () {
if (communicate.isSupportedFunction("getHeight"))
return communicate.getHeight();
else
return UNSUPPORTED;
};
this.GetCurrentWidth = function () {
if (communicate.isSupportedFunction("getWidth"))
return communicate.getWidth();
else
return UNSUPPORTED;
};
this.GetSearchTerm = function () { //TODO: find out what is " if (!myIsAllowNonPrivacy) SetLastError(1); "
if (communicate.isSupportedFunction("getSearchTerm"))
return communicate.getSearchTerm();
else
return UNSUPPORTED;
};
this.GetVersion = function () {
if (communicate.isSupportedFunction("getVersion"))
return communicate.getVersion();
else
return UNSUPPORTED;
};
this.RefreshComponentById = function (strCompId) {
if (communicate.isSupportedFunction("refreshComponentById"))
return communicate.refreshComponentById(strCompId);
else
return UNSUPPORTED;
};
this.HandleHeight = function() {
if (!communicate.isSupportedFunction("handleHeight")) //toolbar not installed or toolbar doesn't support this function
location.href = "http://upgrade.conduit-hosting.com/UpdateClientComponent/Default.aspx?ct=EB_TOOLBAR_ID#_self";
};
this.GetToolbarId = function () {
if (communicate.isSupportedFunction("getToolbarId"))
return communicate.getToolbarId();
else
return UNSUPPORTED;
};
this.GetToolbarName = function () {
if (communicate.isSupportedFunction("getToolbarName"))
return communicate.getToolbarName();
else
return UNSUPPORTED;
};
this.GetDownloadPageUrl = function () {
if (communicate.isSupportedFunction("getDownloadPageUrl"))
return communicate.getDownloadPageUrl();
else
return UNSUPPORTED;
};
this.GetInfo = function () {
if (communicate.isSupportedFunction("getInfo"))
return JSON.parse(communicate.getInfo());
else
return UNSUPPORTED;
};
this.HtmlNotification = function (strTitle, logoUrl, strHtml, notificationLengthSeconds) {
this.sendAlert = function () {
if (notificationLengthSeconds > 60) notificationLengthSeconds = 60;
if (notificationLengthSeconds < 0) notificationLengthSeconds = 10;
if (!strHtml) return ReturnValues.returnCodes.errorInParameters;
if (communicate.isSupportedFunction("sendInstantAlertByHtml2")) {
communicate.sendInstantAlertByHtml2(strTitle, logoUrl, strHtml, notificationLengthSeconds);
} else {
return UNSUPPORTED;
}
}
return (this);
};
this.CustomNotification = function (strTitle, logoUrl, HtmlObj, notificationLengthSeconds) {
return new this.HtmlNotification(strTitle, logoUrl, JSON.stringify(HtmlObj), notificationLengthSeconds);
};
this.TextNotification = function (strTitle, logoUrl, strHeadline, strUrl, strLine1, strLine2, notificationLengthSeconds) {
this.sendAlert = function () {
if (!notificationLengthSeconds) notificationLengthSeconds = 10;
if (notificationLengthSeconds > 60) notificationLengthSeconds = 60;
if (notificationLengthSeconds < 0) notificationLengthSeconds = 10;
if (!strLine1 && !strLine2 && !strHeadline) return;
var getAlertHtml = function () {
var publisherAlertHtml = '<div style="padding:3px 0px 0px 0px; height: 65px; overflow: hidden !important;"><div style="color: rgb(0,82,170); font-family:Arial; font-size: 13px; margin-top:2px; padding:0px;">{1}</div><div style="font-family:Arial; font-size: 11px; margin:2px 1px 0px 1px;">{2}</div></div>';
var publisherAlertHtmlLinux = '<div style="padding:3px 0px 0px 0px; height: 65px; overflow: hidden !important;"><div style="color: rgb(0,82,170); font-family:Arial; font-size: 12px; margin-top:2px; padding:0px;">{1}</div><div style="font-family:Arial; font-size: 10px; margin:2px 1px 0px 1px;">{2}</div></div>';
var info = GetInfo();
if (info && info.general.OS.toString().toLowerCase() == "linux")
publisherAlertHtml = publisherAlertHtmlLinux;
var newStrHeadline = (strUrl) ? _BCAPIHelper.stringFormat("<a href=\"{0}\" style=\"text-decoration:underline;\">{1}</a>", strUrl, strHeadline) : strHeadline;
var publisherAlert = '<div style="font-family:Arial; font-size: 11px; margin:2px 1px 0px 1px;">{0}</div><div style="font-family:Arial; font-size: 11px; margin:2px 1px 0px 1px;">{1}</div></div>';
var description = _BCAPIHelper.stringFormat(publisherAlert, strLine1.replace(/\n/, "<br />"), strLine2.replace(/\n/, "<br />"));
var strHtml = _BCAPIHelper.stringFormat(publisherAlertHtml, strHeadline, newStrHeadline, description);
return xmlHtml = '<html xmlns="http://www.w3.org/1999/xhtml"><head><style type="text/css">body{margin:2px;} .ebLink{color: #004498;} .ebLink:hover{text-decoration: underline;} .msgText{font-family:Arial; font-size: 11px;}</style><title>Untitled Page</title></head><body>'
+ strHtml + '</body></html>';
};
var getNotificationHtml = function () {
var alertAPIUrl = "http://api.qasite.com/alertApi.js";
var htmlTemplate = '<html xmlns="http://www.w3.org/1999/xhtml"><head><style type="text/css">body{margin: 0px; padding-left: 10px; padding-right: 10px;}.ebLink{color: #004498;}.ebLink:hover{text-decoration: underline;}.msgText{font-family: Arial;font-size: 11px;}</style><title>EB_TITLE</title><script type="text/javascript" src="{0}"></script></head><body><div style="padding: 3px 0px 0px 0px; height: 97px; overflow: hidden !important;"><div style="text-decoration:underline; font-family: Arial; font-size: 13px; margin-top: 2px;padding: 0px;">{1}</div><div style="font-family: Arial; font-size: 11px; margin: 2px 1px 0px 1px;"><div style="font-family: Arial; font-size: 11px; margin: 2px 1px 0px 1px;">{2}</div><div style="font-family: Arial; font-size: 11px; margin: 2px 1px 0px 1px;">{3}</div></div></div></body></html>';
var htmlHeadlineRegular = '<span>{0}</span>';
var htmlHeadlineLink = '<span style="text-decoration:underline; color: rgb(0,82,170); cursor:pointer;cursor:hand;" onclick="openLink(\'{0}\', \'TAB\')">{1}</span>';
var htmlHeadline = (strUrl) ? _BCAPIHelper.stringFormat(htmlHeadlineLink, strUrl, strHeadline) : _BCAPIHelper.stringFormat(htmlHeadlineRegular, strHeadline);
return _BCAPIHelper.stringFormat(htmlTemplate, alertAPIUrl, htmlHeadline, strLine1, strLine2);
};
var apiVer = parseFloat(GetAPIHostVersion());
var fullHtml = (apiVer < 2.3) ? getAlertHtml() : getNotificationHtml();
if (communicate.isSupportedFunction("sendInstantAlertByHtml2"))
communicate.sendInstantAlertByHtml2(strTitle, logoUrl, fullHtml, notificationLengthSeconds, strUrl);
else
return UNSUPPORTED;
}
return (this);
};
this.RegisterForMessaging = function (key) {
if (!key) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("registerForMessaging"))
return communicate.registerForMessaging(key, window);
else
return UNSUPPORTED;
};
this.SendMessage = function (key, data) {
if (!key || !data) return ReturnValues.returnCodes.errorInParameters; //In origin was just return, maybe we should allow no data
if (communicate.isSupportedFunction("sendMessage"))
return communicate.sendMessage(key, data);
else
return UNSUPPORTED;
};
//IE will override
this.JSInjection = function (strScript, iTabId, bInjectToIframes) {
if (!strScript) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("injectScript"))
return communicate.injectScript(strScript, iTabId, bInjectToIframes, window);
else
return UNSUPPORTED;
};
this.JSInjectionPermanent = function (strScript, bInjectToIframes) {
if (!strScript) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("injectScriptPermanent"))
return communicate.injectScriptPermanent(strScript, bInjectToIframes);
else
return UNSUPPORTED;
};
this.CrossDomainHttpRequest = function (callback, method, url, postParams, userName, password, headersArr, isSingleCallback) {
if (communicate.isSupportedFunction("crossDomainHttpRequest")) {
var strJsonHeaders = "",
arrOfHeaders = [];
method = method || "GET";
if (!url || !callback)
return ReturnValues.returnCodes.errorInParameters;
if (headersArr) {
for (var i = 0; i < headersArr.length; i++)
arrOfHeaders.push(headersArr[i].toArray());
strJsonHeaders = JSON.stringify(arrOfHeaders);
}
var hashKey = parseInt(Math.random() * 100000);
if (!isSingleCallback) {
_BCAPIHelper.callbacksHash[hashKey] = callback;
return communicate.crossDomainHttpRequest(hashKey, method, url, postParams, userName, password, strJsonHeaders, window);
} else {
_BCAPIHelper.callbacksHash[url] = callback;
return communicate.crossDomainHttpRequest(url, method, url, postParams, userName, password, strJsonHeaders, window);
}
} else {
return UNSUPPORTED;
}
};
this.GetLastError = function () {
if (communicate.isSupportedFunction("lastError"))
return communicate.lastError;
else
return UNSUPPORTED;
};
this.AjaxResponse = function (hashKey, strData, httpCode) {
_BCAPIHelper.callbacksHash[hashKey](strData, httpCode);
delete _BCAPIHelper.callbacksHash[hashKey];
};
this.GetApiVersion = function () {
if (communicate.isSupportedFunction("getApiVersion"))
return communicate.getApiVersion();
else
return UNSUPPORTED;
};
this.IsAppView = function () {
if (communicate.isSupportedFunction("isAppView"))
return communicate.isAppView();
else
return UNSUPPORTED;
};
this.NavigateInFrame = function (url, targetFrame) {
if (!url || !targetFrame) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("navigateInFrame"))
return communicate.navigateInFrame(url, targetFrame);
else
return UNSUPPORTED;
};
this.IsAppInstalled = function (guid) {
if (!guid) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("isAppInstalled"))
return communicate.isAppInstalled(guid);
else
return UNSUPPORTED;
};
this.SetLinksTarget = function (target) {
if (!target) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicate.isSupportedFunction("setLinksTarget"))
return communicate.setLinksTarget(target);
else
return UNSUPPORTED;
};
this.SetSkin = function (objParams) {
var strParams = (objParams) ? JSON.stringify(objParams) : "";
if (communicate.isSupportedFunction("setSkin"))
return communicate.setSkin(strParams);
else
return UNSUPPORTED;
};
this.SaveFile = function (strFileName, strFileContent) {
if (!strFileName || strFileName.toString().length > 256)
return false;
if (communicate.isSupportedFunction("saveFile"))
return communicate.saveFile(strFileName, strFileContent);
else
return UNSUPPORTED;
};
this.LoadFile = function (strFileName) {
if (!strFileName || strFileName.toString().length > 256)
return false;
if (communicate.isSupportedFunction("loadFile"))
return communicate.loadFile(strFileName);
else
return UNSUPPORTED;
};
this.DeleteFile = function (strFileName) {
if (!strFileName || strFileName.toString().length > 256) // No validation in origin
return false;
if (communicate.isSupportedFunction("deleteFile"))
return communicate.deleteFile(strFileName);
else
return UNSUPPORTED;
};
this.IsConduitApp = function () {
return true; // since this is FF and IE only, Chrome should override this
};
this.LaunchGadget = function (strUrl, width, height, features) {
// Maybe we should add some kind of validation here
if (communicate.isSupportedFunction("openGadget3"))
return communicate.openGadget3(strUrl, width, height, features);
else
return UNSUPPORTED;
};
this.NavigateInNewTab = function (url) {
if (!url) return false;
if (communicate.isSupportedFunction("navigateInNewTab"))
return communicate.navigateInNewTab(url);
else {
if (url.indexOf("http") != 0 && url.indexOf("https") != 0 && url.indexOf("ftp") != 0 && url.indexOf("file") != 0) {
url = "http://" + url;
}
location.href = url + '#_tab';
}
};
this.NavigateInTab = function (url, tabId) {
if (communicate.isSupportedFunction("navigateInTab"))
return communicate.navigateInTab(url, tabId);
else
return UNSUPPORTED;
};
this.IsExtensionInstalled = function (guid, callback) {
if (communicate.isSupportedFunction("isExtensionInstalled"))
return communicate.isExtensionInstalled(guid, callback);
else
return UNSUPPORTED;
};
this.LaunchExternalProgram = function (exeAlias, params, notFoundLink) {
if (communicate.isSupportedFunction("executeApplication"))
communicate.executeApplication(exeAlias, params, notFoundLink);
else
return UNSUPPORTED;
};
this.GetTranslation = function (key, callback) {
if (communicate.isSupportedFunction("getTranslation"))
communicate.getTranslation(key, callback);
else
return UNSUPPORTED;
};
this.IsToolbarVisible = function (callback) {
if (communicate.isSupportedFunction("isToolbarVisible"))
communicate.isToolbarVisible(callback);
else
return UNSUPPORTED;
};
this.ExecuteScriptInFrame = function (frameId, script) {
if (communicate.isSupportedFunction("executeScriptInFrame"))
communicate.executeScriptInFrame(frameId, script);
else
return UNSUPPORTED;
}
};
// FF api object.
function FF_BcApi() {
var communicator = BCAPI;
communicator.isSupportedFunction = function (functionName) {
if (BCAPI.storeKey && !communicator.storeKey) {
communicator = BCAPI;
communicator.isSupportedFunction = function (functionName) { return (communicator[functionName]) }
BcApiObj.setCommunicator(communicator);
}
return (communicator[functionName])
}
BcApi.call(this, communicator);
}
FF_BcApi.prototype = new BcApi();
FF_BcApi.constructor = FF_BcApi;
// IE api object.
function IE_BcApi() {
// For SmartBar
if (!Array.prototype.indexOf) {
Array.prototype.indexOf = function (elt /*, from*/) {
var len = this.length;
var from = Number(arguments[1]) || 0;
from = (from < 0)
? Math.ceil(from)
: Math.floor(from);
if (from < 0)
from += len;
for (; from < len; from++) {
if (from in this &&
this[from] === elt)
return from;
}
return -1;
};
}
var communicator = window.external;
BcApi.call(this, communicator);
this.StoreKey = function(key, value) {
if (key.toString().length >= 8000 || (value && value.toString().length >= 8000)) {
var strVersion = GetVersion();
if (strVersion != _BCAPIHelper.UNSUPPORTED && !compareVersions(strVersion, _BCAPIHelper.IEVersions.keyOverflowBlocking))
return UNSUPPORTED;
}
if (communicator.isSupportedFunction("storeKey"))
communicator.storeKey(key, value);
else
return UNSUPPORTED;
};
this.StoreGlobalKey = function(key, value) {
if (key.toString().length >= 8000 || (value && value.toString().length >= 8000)) {
var strVersion = GetVersion();
if (strVersion != _BCAPIHelper.UNSUPPORTED && !compareVersions(strVersion, _BCAPIHelper.IEVersions.keyOverflowBlocking))
return UNSUPPORTED;
}
if (communicator.isSupportedFunction("storeGlobalKey"))
communicator.storeGlobalKey(key, value);
else
return UNSUPPORTED;
};
this.JSInjection = function(strScript) {
if (communicator.isSupportedFunction("injectScript"))
return communicator.injectScript(strScript);
else
return UNSUPPORTED;
};
this.GetTranslation = function (key, callback) {
if (communicator.isSupportedFunction("getTranslation")) {
var hashKey = parseInt(Math.random() * 100000);
_BCAPIHelper.callbacksHash[hashKey] = callback;
communicator.getTranslation(key, hashKey, window);
}
else
return UNSUPPORTED;
};
this.IsToolbarVisible = function (callback) {
if (communicator.isSupportedFunction("isToolbarVisible")) {
var hashKey = parseInt(Math.random() * 100000);
_BCAPIHelper.callbacksHash[hashKey] = callback;
communicator.isToolbarVisible(hashKey, window);
}
else
return UNSUPPORTED;
};
this.RegisterForMessaging = function (key) {
if (!key) return ReturnValues.returnCodes.errorInParameters; //In origin was just return
if (communicator.isSupportedFunction("registerForMessaging"))
return communicator.registerForMessaging(key);
else
return UNSUPPORTED;
};
}
IE_BcApi.prototype = new BcApi();
IE_BcApi.constructor = IE_BcApi;
/* Smartbar code */
function SmartBar_BcApi(){
function readCookie(name) {
var nameEQ = name + "=";
var ca = document.cookie.split(';');
for(var i=0;i < ca.length;i++) {
var c = ca[i];
while (c.charAt(0)==' ') c = c.substring(1,c.length);
if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
}
return null;
}
if (!Array.prototype.indexOf) {
Array.prototype.indexOf = function (elt /*, from*/) {
var len = this.length;
var from = Number(arguments[1]) || 0;
from = (from < 0)
? Math.ceil(from)
: Math.floor(from);
if (from < 0)
from += len;
for (; from < len; from++) {
if (from in this &&
this[from] === elt)
return from;
}
return -1;
};
}
// Embedding the NP API:
if (typeof(window.chrome) !== "undefined"){
document.write("<embed " + "id=\"pluginObj\" " + "type=\"ConduitChromeApi\"" + " style=\"height:0; visibility: hidden; position: fixed;\" " + "/>");
var npapiPlugin = document.getElementById("pluginObj");
}
var smartbarBcApiObj,
conduitAppData = getContext(window.name) ? getContext(window.name) :
(typeof(localStorage) !== "undefined" ? localStorage.getItem("smartbarBcApi") : undefined);
if (/___requireStorage/.test(document.location.href) || conduitAppData || typeof (abstractionlayer) !== "undefined") {
var url = document.location.href.replace(/&___requireStorage$/, "");
function smartbarBcApi() {
var conduitStorage = { app: {}, global: {} },
storagePrefix = { global: "" };
function getStorageKey(type, keyName) {
return storagePrefix[type] + keyName;
}
var conduit;
(function () {
var webappApiInterface = { "app": { "getSettingsData": "", "getCurrentContext": "", "embedded": { "setOnBeforeLoadData":"data","setEmbedded": "info", "collapse": "", "expand": "", "getState": "" }, "popup": { "getInfo": "popupId", "set": "url, options", "open": "url, options", "close": "popupId", "resize": "popupId, dimensions", "onClosed": { "addListener": "popupId, eventHandler" },"onNavigate":{ "addListener": "popupId, eventHandler" }, "onShow": { "addListener": "popupId, eventHandler" },"onHide":{ "addListener": "popupId, eventHandler" }, "show": "popupId", "hide": "popupId", "changePosition": "popupId,top,left" }, "icon": { "setBadgeBackgroundColor": "color", "setBadgeText": "text", "setIcon": "details", "setIconText": "text", "setTooltip": "text", "onClicked": { "addListener": "eventHandler"} }, "menu": { "create": "data", "close": "menuId", "open": "data, options", "getData": "menuId", "onCommand": { "addListener": "menuId, eventHandler" }, "onClose": { "addListener": "menuId, eventHandler"}} }, "idle": { "onStateChanged": { "addListener": "threshold, eventHandler"} }, "logging": { "usage": { "log": "actionType, additionalUsageInfo"}, "logError": "message,loggerInfo", "logDebug": "message,loggerInfo", "logInfo": "message,loggerInfo" }, "messaging": { "sendRequest": "destination, logicalName, data, eventHandler", "postTopicMessage": "topic, data", "onRequest": { "addListener": "logicalName, eventHandler" }, "onExternalRequest": { "addListener": "logicalName, eventHandler" }, "onTopicMessage": { "addListener": "topic, eventHandler"} }, "network": { "httpRequest": "e", "sockets": { "connect": "options", "send": "connectionToken, data, dataIdentity", "close": "connectionToken", "onMessage": { "addListener": "connectionToken, eventHandler" }, "onConnectionEstablished": { "addListener": "eventHandler"}} }, "platform": { "getToolbarVersion":"" ,"executeExternalProgram": "registeredName, parameters", "getAppsList": "", "getInfo": "", "isAppInstalled": "appId", "refresh": "forceRefresh", "refreshApp": "appId", "setSkin": "settings", "search": { "getTerm": "", "onExecuted": { "addListener": "eventHandler" }, "onTextChanged": { "addListener": "eventHandler"} }, "getScreenHeight": "", "getScreenWidth": "", "openApp": "guid" }, "tabs": { "create": "e", "executeScript": "tabId, details", "get": "tabId", "getAllInWindow": "windowId", "getSelected": "windowId", "insertCss": "tabId, cssData", "remove": "tabId", "sendRequest": "tabId, topic, data", "onRequest": { "addListener": "topic,eventHandler" }, "update": "tabId, updateProperties", "updateWithPost": "tabId, updateProperties, postParams", "onBeforeNavigate": { "addListener": "eventHandler" }, "onCreated": { "addListener": "eventHandler" }, "onDocumentComplete": { "addListener": "eventHandler" }, "onRemoved": { "addListener": "eventHandler" }, "onSelectionChanged": { "addListener": "eventHandler" }, "onNavigateComplete": { "addListener": "eventHandler" }, "onNavigateError": { "addListener": "eventHandler"} }, "windows": { "create": "e", "get": "windowId", "getAll": "options", "getLastFocused": "", "remove": "windowId", "update": "windowId, updateProperties", "onCreated": { "addListener": "eventHandler" }, "onFocusChanged": { "addListener": "eventHandler" }, "onRemoved": { "addListener": "eventHandler"} }, "notifications": { "showNotification": "notificationData", "register": "data" }, "advanced": {"services":{"addService": {"addListener":"serviceData, eventHandler"}, "invokeService" : "serviceName", "updateService": "serviceName, updateData", "searchAPI":{"getData":"","onChange":{"addListener":"eventHandler"}}},"getGlobalUserId": "","hideApp":"appId","showApp":"appId","messaging": { "postTopicMessage": "topic, data", "onTopicMessage": { "addListener": "topic, eventHandler" }, "getSyncStorage": "", "sendRequest": "logicalName, data, eventHandler", "onRequest": { "addListener": "logicalName, eventHandler" }, "sendRequestToModel": "method, data" }, "localization": { "getKey": "keyName", "getLocale": "" }, "notifications": { "onShow": { "addListener": "eventHandler" }, "onRegister": { "addListener": "eventHandler"} }, "studio": { "apps": { "load": "path", "reload": "appId", "disable": "appId", "enable": "appId", "remove": "appId", "getList": ""}} }, "storage": { "app": { "items": { "exists": "key", "get": "key", "set": "key, value", "remove": "key", "onChange": { "addListener": "eventHandler"} }, "keys": { "exists": "key", "get": "key", "set": "key, value", "remove": "key", "onChange": { "addListener": "eventHandler"}} }, "global": { "items": { "get": "key", "set": "key, value", "remove": "key", "onChange": { "addListener": "eventHandler"} }, "keys": { "get": "key", "set": "key, value", "remove": "key", "onChange": { "addListener": "eventHandler"}}} }, "encryption": { "encrypt": "data", "decrypt": "data", "hash": "data", "decodeText": "text,type,charset", "decodeCharset": "text,inCharset"} },
webAppApiFront = {"platform.getScreenHeight":true, "storage.app.items.exists": true, "storage.app.items.get":true, "storage.app.keys.exists": true,"storage.app.keys.get":true, "app.embedded.setEmbedded": true, "app.embedded.collapse": true, "app.embedded.expand": true },
msgSender;
function getUrlAppData() {
var localStorageKey = "smartbarBcApi",
url = document.location.href.replace(/&___requireStorage$/, ""),
// For BC API only!
appDataMatch = url.match(/(?:#|&)appData=(.*)/);
if (appDataMatch) {
conduit.currentApp = JSON.parse(decodeURIComponent(appDataMatch[1]));
//document.location.hash = ""; Do not uncomment - not working in chrome
if (typeof (conduit.currentApp.popupId) !== "undefined" && typeof (localStorage) !== "undefined") {
localStorage.setItem(localStorageKey, JSON.stringify(conduit.currentApp));
}
} else if (typeof (localStorage) !== "undefined") {
var conduitAppData = localStorage.getItem(localStorageKey);
if (conduitAppData) conduit.currentApp = JSON.parse(conduitAppData);
}
return conduit.currentApp;
}
function getAppData() {
conduit.currentApp = getContext(window.name) ? getContext(window.name) : getUrlAppData(); //if no context use the old way
// to apply context on chrome facebook login window
if (typeof (conduit.currentApp.popupId) !== "undefined" && typeof (localStorage) !== "undefined") {
localStorage.setItem("smartbarBcApi", JSON.stringify(conduit.currentApp));
}
if (conduit.currentApp) msgSender = JSON.stringify({
appId: conduit.currentApp.appId,
context: conduit.currentApp.context,
viewId: conduit.currentApp.viewId,
popupId: conduit.currentApp.popupId,
menuId: conduit.currentApp.menuId,
isMenu: conduit.currentApp.menuId,
apiPermissions: conduit.currentApp.apiPermissions ||conduit.currentApp.info.apiPermissions
});
}
conduit = convertToFunctions(webappApiInterface);
getAppData();
var localMessaging = (function (){
var callbackMap = {};
var generateCallbackId = function () {
var callbackId = (+new Date()) + "_" + Math.ceil(Math.random() * 5000);
return (callbackMap[callbackId]) ? generateCallbackId() : callbackId;
};
var messageResponseHandler = function (event) {
if (typeof event.data === "string") {
try{
var data = JSON.parse(event.data);
if (data && data.origin && data.origin === "webappApiFront") {
if (callbackMap[data.logicalName]) {
callbackMap[data.logicalName].callback(data.data, event.source);
if (!callbackMap[data.logicalName].persist) {
delete callbackMap[data.logicalName];
}
}
}
}
catch(e){}
}
};
if (window.addEventListener){
window.addEventListener("message", messageResponseHandler, false);
}
else {
window.attachEvent('onmessage',messageResponseHandler);
}
var onLocalRequest = function (logicalName, persist, callback) {
callbackMap[logicalName] = {callback: callback, persist: persist};
};
var sendLocalRequest = function (logicalName, data , target) {
var message = {
logicalName: logicalName,
data: data,
origin : window.name
};
if (target) {
target.postMessage(JSON.stringify(message), "*");
}
else if (window.chrome){
var currentWindow = window;
while (currentWindow.parent != window.top) {
currentWindow = currentWindow.parent;
}
currentWindow.postMessage(JSON.stringify(message), "*");
}
else if (window.top) {
window.top.postMessage(JSON.stringify(message), "*");
}
};
return {
onLocalRequest: {addListener: onLocalRequest},
sendLocalRequest: sendLocalRequest,
generateCallbackId: generateCallbackId
};
})();
var CUSTOM_DIV_ID = "__conduitCustomDiv" + (conduit && conduit.currentApp && conduit.currentApp.info &&  conduit.currentApp.info.toolbar && conduit.currentApp.info.toolbar.id ? conduit.currentApp.info.toolbar.id : "_NOAPPID");
var createHiddenDiv = function () {
// If the custom hidden DIV doesn't exist (not created by the injected script yet) - creating it.
var myCustomDiv = document.getElementById(CUSTOM_DIV_ID);
if (!myCustomDiv) {
// If hidden DIV doesn't exist, creating it.
myCustomDiv = window.document.createElement("div");
myCustomDiv.setAttribute("id", CUSTOM_DIV_ID);
myCustomDiv.setAttribute("style", "display:none");
if (document.head) {
document.head.appendChild(myCustomDiv);
}
}
};
createHiddenDiv();
if (window.addEventListener)
window.addEventListener("hashchange", getAppData, false)
else
window.attachEvent("onhashchange", getAppData);
var messaging = (function () {
var hasListener = false,
webAppApiReady,
webappApiQueue = [],
listeners = {},
absMessaging = typeof (abstractionlayer) !== "undefined" ? abstractionlayer.commons.messages :
typeof (window.chrome) !== "undefined" ?
(function () {
var commandSeperatorChar = "_BCAPI_CMD_SEP_";
var sysReqReceivedEvent = 'sysReqReceivedEvent';
var listenerAddedEvent = 'listenerAddedEvent';
var bcapiListeners = {};
bcapiListeners[sysReqReceivedEvent] = {};
bcapiListeners[listenerAddedEvent] = {};
// Sends an event to the extension. event data is contained inside the hidden DIV and read by the extension which shares the same DOM.
var sendEventData = function (hiddenDiv, eventName, eventData) {
try {
var customEvent = document.createEvent('Event');
customEvent.initEvent(eventName, true, true);
hiddenDiv.innerText += JSON.stringify(eventData) + commandSeperatorChar;
hiddenDiv.dispatchEvent(customEvent);
} catch (generalException) {
}
};
var listenerLogic = function(eventName) {
try {
var msgsArray = hiddenDiv.innerText.split(commandSeperatorChar);
//console.log("BCAPI Received: ", msgsArray);
for (var i = 0; i < msgsArray.length; i++) {
if (msgsArray[i]) {
var __message = JSON.parse(msgsArray[i]);
if (__message && __message.msgSender && bcapiListeners[eventName] && typeof bcapiListeners[eventName][__message.msgSender] === 'function')
{
//console.log("Running callback for listener: ", __message.msgSender);
bcapiListeners[eventName][__message.msgSender](__message, __message.msgSender)
} else {
//console.log("Not running callback for listener: ", __message.msgSender);
}
}
}
}
catch (generalException) {
console.error("BCAPI. Error parsing command: ",
hiddenDiv.innerText, generalException);
}
};
var hiddenDiv = document.getElementById(CUSTOM_DIV_ID);
if (hiddenDiv) {
hiddenDiv.addEventListener(sysReqReceivedEvent, function () {
listenerLogic(sysReqReceivedEvent);
});
hiddenDiv.addEventListener(listenerAddedEvent, function () {
listenerLogic(listenerAddedEvent);
});
} else {
console.error("ERROR: BCAPI STILL NO HIDDEN DIV: ", hiddenDiv);
}
// Listens for an event received from the extension and runs the listener callback with the data contained inside the hidden DIV.
var addEventListener = function (hiddenDiv, eventName, listenerCallback, sender) {
if (typeof bcapiListeners[eventName] !== undefined) {
//		console.log("BCAPI - Adding listener for: ", sender, " eventname - ", eventName);
bcapiListeners[eventName][sender] = listenerCallback;
}
else {
console.error("BCAPI Error: eventName - ", eventName, " doesn't exist inside listeners hash");
}
};
return {
sendSysReq: function (dest, sender, data, callback) {
var __sendMessage = {
action: "sendSystemRequest",
data: {
dest: dest,
sender: sender,
data: data,
type: "addListenerBack"
}
};
try {
var hiddenDiv = document.getElementById(CUSTOM_DIV_ID);
if (hiddenDiv) {
// Adding listener from sendRequest response via DIV in order to run the callback at the end.
var myData = JSON.parse(data);
sender = myData ? myData.method : "";
var listenerCallback = function (result, listenerSender) {
if (listenerSender === sender) {
var resultData = "{}";
try {
if (result && result.data && result.data.data) {
resultData = result && result.data && result.data.data ? JSON.parse(result.data.data) : "{}";
} else if (result && result.data && !result.data.data) {
resultData = result && result.data ? JSON.parse(result.data) : "{}";
}
} catch (e) {
try {
if (result && result.data && result.data.data) {
// Special case in which no JSON object is returned - only a string.
resultData = result && result.data && result.data.data ? result.data.data : "{}";
} else if (result && result.data && !result.data.data) {
resultData = result && result.data ? result.data : "{}";
}
} catch (e2) {
resultData = "{}";
}
}
if (callback && typeof callback === 'function') {
// Not running callback if callbackType exists (i.e. a listener was added via sendSysReq).
if (resultData && !resultData._callbackType) {
try {
if (JSON.stringify(resultData) === '"{}"') resultData = "";
} catch (e) { }
callback(resultData);
}
}
}
else {
}
}
var sender = JSON.parse(data);
sender = sender ? sender.method : "";
// Adding listener for sysRequest future response
addEventListener(hiddenDiv, sysReqReceivedEvent, listenerCallback, sender);
// Sending sys request.
sendEventData(hiddenDiv, 'sendSysReqEvent', __sendMessage);
} else {
console.trace();
}
}
catch (generalException) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
return { result: '', status: 9999, description: 'SEND REQUEST ERROR' };
}
},
onSysReq: {
addListener: function (logicalName, callback) {
var __sendMessage = {
action: "addSysReqListener",
data: {
type: (/popup$/.test(logicalName)) || (/embedded$/.test(logicalName))  ? "addListenerFront" : "addListenerBack",
logicalName: logicalName
}
};
try {
var hiddenDiv = document.getElementById(CUSTOM_DIV_ID);
if (hiddenDiv) {
var listenerCallback = function (response) {
if (response.result === true) {
var addListenerCallback = function (request) {
if (request.action) {
if (request.action === "listenerGetMessage") {
if (request.data.dest === logicalName) {
callback.apply(this, [request.data.data, request.data.sender, request.sendResponse]);
}
}
}
};
// Adding listener for add listener future response
addEventListener(hiddenDiv, listenerAddedEvent, addListenerCallback, logicalName);
// Sending add listener event.
sendEventData(hiddenDiv, 'addListenerEvent', __sendMessage);
}
}
// Adding listener for sysRequest future response
addEventListener(hiddenDiv, sysReqReceivedEvent, listenerCallback, logicalName);
// Sending sys request.
sendEventData(hiddenDiv, 'sendSysReqEvent', __sendMessage);
} else {
}
}
catch (generalException) {
return false;
}
}
},
onTopicMsg: {
addListener: function (strTopicName, callback) {
var subscriber_id = new Date().getTime() + "_" + Math.ceil(Math.random() * 128);
var __sendMessage = {
action: "subscribeForTopic",
data: {
subscriber_id: subscriber_id,
type: "addListenerFront",
topicName: strTopicName
}
};
try {
var hiddenDiv = document.getElementById(CUSTOM_DIV_ID);
if (hiddenDiv) {
var listenerCallback = function (response) {
var sender = response.msgSender;
if (strTopicName === sender) {
if (response && response.data) {
if (response.data && response.data.type === "postTopic" || response.data.type === "sendRequest") {
if (response.data.topicName === strTopicName) {
callback.apply(this, [response.data.data || null, response.data.senderName || null, callback]);
}
}
} else if (response && response.data && response.data.result) {
var addListenerCallback = function (request) {
if (request.data && request.data.action === "topicGetMessage" || request.data.action === "listenerMessagesFront") {
if (request.data.data && request.data.data.topicName === strTopicName) {
callback.apply(this, [request.data.data.data, request.data.data.senderLogicalName, callback]);
}
}
}
// Adding listener for add listener future response
addEventListener(hiddenDiv, listenerAddedEvent, addListenerCallback, strTopicName);
}
// Sending add listener event.
sendEventData(hiddenDiv, 'addListenerEvent', __sendMessage);
}
}
// Adding listener for sysRequest future response
addEventListener(hiddenDiv, sysReqReceivedEvent, listenerCallback, strTopicName);
// Sending sys request.
sendEventData(hiddenDiv, 'sendSysReqEvent', __sendMessage);
} else {
}
}
catch (generalException) {
return false;
}
}
},
postTopicMsg: function (topic, sender, data) {
var __sendMessage = {
action: "postTopicMessage",
data: {
topicName: topic,
senderLogicalName: sender,
data: data
}
};
try {
var hiddenDiv = document.getElementById(CUSTOM_DIV_ID);
if (hiddenDiv) {
// Adding listener from sendRequest response via DIV in order to run the callback at the end.
var listenerCallback = function (result, listenerSender) {
}
// Sending sys request.
sendEventData(hiddenDiv, 'sendSysReqEvent', __sendMessage);
} else {
}
}
catch (generalException) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
return { result: '', status: 9999, description: 'SEND REQUEST ERROR' };
}
}
};
} ()):
typeof (window.safari) !== "undefined" ?
(function () {
var getDefaultProxy = function () {
var args = [].slice.call(arguments);
var methodCall = { msgObj: null, msgMethod: null };
var getMethodCallInfo = function () {
if (methodCall.msgObj && methodCall.msgMethod) {
return methodCall;
}
methodCall.msgObj = safari.extension.globalPage.contentWindow.conduit.abstractionlayer.commons.messages;
methodCall.msgMethod = null;
for (var i = 0; i < args.length; i++) {
if (methodCall.msgMethod) {
methodCall.msgObj = methodCall.msgMethod;
methodCall.msgMethod = methodCall.msgObj[args[i]];
} else {
methodCall.msgMethod = methodCall.msgObj[args[i]];
}
}
return methodCall;
};
return function () {
var methodCallInfo = getMethodCallInfo();
return methodCallInfo.msgMethod.apply(methodCallInfo.msgObj, arguments);
};
};
return {
onSysReq: {
addListener: getDefaultProxy('onSysReq', 'addListener')
},
sendSysReq: getDefaultProxy('sendSysReq'),
isSysReqExists: getDefaultProxy('isSysReqExists'),
postTopicMsg: getDefaultProxy('postTopicMsg'),
onTopicMsg: {
addListener: getDefaultProxy('onTopicMsg', 'addListener')
}
};
})()
: (function () {
var actionsEnum = {
sendSysReq: 1,
postTopicMessage: 2,
subscribeTopicMsg: 3,
onSysReq: 0
},
conduitMessagesProxy = (function () {
var messagesMapHashKeyToCallback = [],
index = 0; // hashId
return {
/*
*	register a send message to map
*  callback - callback function
*/
registerMessage: function (callbackFunc) {
if (typeof (callbackFunc) != 'function') {
return -1;
}
var hashKey = parseInt(Math.random() * 100000, 10);
messagesMapHashKeyToCallback[hashKey] = callbackFunc;
return hashKey;
},
getMessageCallbackById: function (hashId) {
return messagesMapHashKeyToCallback[hashId];
}
};
})();
window.onMessageRecieved = function (hashId, data, sender, responseLogicalName) {
onMessageRecieved(hashId, data, sender, responseLogicalName);
};
/*
*Received when callbackFunc return to the sender
*/
function onMessageRecieved(callbackHashId, data, sender, responseLogicalName) {
var callbackFunc = conduitMessagesProxy.getMessageCallbackById(callbackHashId);
var cbReturn = null;
if (responseLogicalName != '') {
cbReturn = function (dataToReturn) {
window.external.invokePlatformActionSync(8, 6, null, null, null, responseLogicalName, dataToReturn);
}
}
if (callbackFunc != null) {
callbackFunc(data, sender, cbReturn);
}
}
/*
// Sends a point to point message
// strDestLogicalName - the name of the receiver of the message
// strSenderName - the name of the sender of the message
// data - the data to send (can be null)
// callbackFunc - a callbackFunc function to invoke upon destination receiving of the message (can be null)
*/
function sendSysReq(strDestLogicalName, strSenderName, data, callbackFunc, targetMethod, params) {
if (/\.addListener$/.test(targetMethod)) {
var listenerInnerName = (conduit.currentApp.appId + "_" + conduit.currentApp.context + "_" + targetMethod).replace(/\./g, "_");
absMessaging.onTopicMsg.addListener(listenerInnerName, callbackFunc);
data = JSON.parse(data);
data.listenerTopic = listenerInnerName;
data = JSON.stringify(data);
}
// insert the  the proxy map
strSenderName = strSenderName || "1";
data = data || "1";
callbackFunc = callbackFunc || (function (res) { });
var callbackHashId = conduitMessagesProxy.registerMessage(callbackFunc);
window.external.invokePlatformActionSync(8, actionsEnum.sendSysReq, window, "onMessageRecieved", callbackHashId, strDestLogicalName, strSenderName, data);
}
function postTopicMsg(topicName, sender, data) {
if (typeof (data) !== "string")
data = JSON.stringify(data);
if (!data)
data = "";
return JSON.parse(window.external.invokePlatformActionSync(8, actionsEnum.postTopicMessage, topicName, sender, data));
};
return {
sendSysReq: sendSysReq,
onSysReq: {
addListener: function (logicalName, callback) {
var callbackHashId = conduitMessagesProxy.registerMessage(callback);
return JSON.parse(window.external.invokePlatformActionSync(8, actionsEnum.onSysReq, window, "onMessageRecieved", callbackHashId, logicalName));
}
},
onTopicMsg: {
addListener: function (strTopicName, callbackFunc) {
var callbackHashId = conduitMessagesProxy.registerMessage(callbackFunc);
return JSON.parse(window.external.invokePlatformActionSync(8, 3, window, "onMessageRecieved", callbackHashId, strTopicName));
}
},
postTopicMsg: postTopicMsg
};
})();
function getAppDestinationName(appId, logicalName) {
var externalAppId = logicalName ? logicalName.match(/^app:(.*)$/) : null;
externalAppId = externalAppId ? externalAppId[1] : null;
var dest = ["webapp", externalAppId || appId, externalAppId || !logicalName ? "backgroundPage" : logicalName];
return dest.join("_");
}
function getTopicName(appId, topicName, targetMethod) {
var finalTopicName = (targetMethod === "advanced.messaging.postTopicMessage" || targetMethod === "advanced.messaging.onTopicMessage.addListener")
? "adv:" + topicName
: ":" + topicName;
return finalTopicName;
}
// Wrap the callback, to handle general operations before the data is passed on to the actual data.
function getWrappedCallback(callback) {
return function (response) {
if (callback)
callback(response && (typeof (response) == "string" && (/^\{.*\}$/.test(response) || /^\[.*\]$/.test(response))) ? JSON.parse(response) : response);
}
}
function onWebAppApiReady(){
webAppApiReady = true;
if (webappApiQueue.length){
for(var i=0, count=webappApiQueue.length; i < count; i++){
Function.prototype.apply.call(absMessaging.sendSysReq, this, webappApiQueue[i]);
}
}
}
function isSupportedVersion(currentVersion, versionToCheck){
var result;
var currVersionArr = currentVersion.split(".");
var versionToCheckArr = versionToCheck.split(".");
for (var i = 0; i < currVersionArr.length; i++) {
var currVersionElem = currVersionArr[i];
if (versionToCheckArr[i]) {
var versionToCheckElem = versionToCheckArr[i];
if (parseInt(currVersionElem) > parseInt(versionToCheckElem)) {
result = false;
break;
}
else if (parseInt(currVersionElem) < parseInt(versionToCheckElem)) {
result = true;
break;
}
}
else {
if (currVersionElem !== 0) {
result = false;
}
break;
}
}
if (result === undefined) {
result = true;
}
return result;
}
absMessaging.onTopicMsg.addListener("onWebAppApiReady", onWebAppApiReady);
absMessaging.sendSysReq("webappApi", JSON.stringify({ sender: "BAAPI" }), JSON.stringify({ method: "commons.isReady", params: [] }), function(result){
try{
result = JSON.parse(result);
}
catch(e){}
finally{
if (!result.status) // also covers the case result is "true".
onWebAppApiReady();
}
});
return {
// Sends the request to the webapp API:
sendRequest: function (targetMethod, params, onSuccess, onError) {
var paramCallback;
var isFront = false;
if (params && params.length > 0 &&  params[params.length - 1] && (params[params.length - 1].isFront === true)) {
if (conduit.currentApp.context == "embedded"){
if (isSupportedVersion("10.7.0.2",conduit.currentApp.info.toolbar.version)){
isFront = true;
}
}
params.pop();
}
if (params && params.length > 0 && typeof (params[params.length - 1]) === "function") {
// we assume that only addListener functions contains a callback function (as the last parameter)
// we will call this callback function when a response from an addListener function in the webAppApi is returned.
paramCallback = params.pop();
if (!/messaging/.test(targetMethod) && !/tabs\.onRequest/.test(targetMethod) && conduit.currentApp.context == "embedded") {
if (isSupportedVersion("10.7.0.2",conduit.currentApp.info.toolbar.version)){
isFront = true;
}
}
}
var callback = function (response, sender, callback) {
if (response && typeof (response) === "object" && response.errorMessage) {
if (onError)
onError(response);
}
else {
// callback is defined when an OnRequest was fired directly (without the webAppApi)
// response.type is cbSuccess when a listener was added successfuly using the webAppApi
// when sendRequest is sent (without the webAppApi) we have a paramCallback but the reponse does not contain a type.
if (paramCallback && (callback !== undefined || response._callbackType === undefined)) {
if (typeof (response) === "object" && response._responseType) {
paramCallback.apply(this, response.data);
}
else {
paramCallback(response, sender, callback);
}
}
else if (onSuccess) {
if (response._callbackType) {
response = response.result || response;
}
if (typeof (response) === "object" && response._responseType)
onSuccess.apply(this, response.data);
else
onSuccess(response);
}
}
};
var dest, data;
// If messaging between the app parts is required, just do it (but make sure it's internal):
if (/messaging\.sendRequest$/.test(targetMethod)) {
if (targetMethod === "advanced.messaging.sendRequest") {
dest = "adv:" + params[0];
data = params[1];
}
else {
dest = getAppDestinationName(conduit.currentApp.appId, params[0]);
data = JSON.stringify({ method: params[1], data: params[2] });
}
}
else if (/messaging\.onRequest/.test(targetMethod) || /messaging\.onExternalRequest/.test(targetMethod)) {
if (targetMethod === "advanced.messaging.onRequest.addListener") {
absMessaging.onSysReq.addListener("adv:" + params[0], callback);
}
else {
if (!hasListener) {
// Set a single-point listener for all requests send to this specific part of the web app:
absMessaging.onSysReq.addListener(
getAppDestinationName(conduit.currentApp.appId, conduit.currentApp.context),
function (data, sender, requestCallback) {
if (listeners) {
var dataObj = JSON.parse(data),
eventHandlers = listeners[dataObj.method];
if (eventHandlers) {
for (var i = 0; i < eventHandlers.length; i++) {
eventHandlers[i](dataObj.data, sender, function (data) {
if (typeof (data) === "object" && data)
data = JSON.stringify(data);
requestCallback(data);
});
}
}
}
}
);
hasListener = true;
}
var logicalName = params[0],
listener = listeners[logicalName];
if (!listener)
listener = listeners[logicalName] = [];
listener.push(callback); // Add the event handler
}
}
else if (/tabs\.onRequest/.test(targetMethod)){
absMessaging.onTopicMsg.addListener((conduit.currentApp.ctid || conduit.currentApp.info.toolbar.id)  + "_" + conduit.currentApp.appId+"_tabs_"+params,function(data){
data = JSON.parse(data);
var cb = function (uresData){
var contextData = {topic: data.topic, userData:uresData, tabId: data.tabId};
absMessaging.sendSysReq("webAppApiInjectManager", "BAAPI", JSON.stringify(contextData));
}
paramCallback(data.userData, data.tabId, cb);
});
}
else if (/messaging\.postTopicMessage/.test(targetMethod)) {
var postData = params[1];
if (!postData)
postData = "";
else if (typeof (postData) !== "string")
postData = JSON.stringify(postData);
callback(absMessaging.postTopicMsg(
getTopicName(conduit.currentApp.appId, params[0], targetMethod),
JSON.stringify(conduit.currentApp),
postData)
);
}
else if (/messaging\.onTopicMessage/.test(targetMethod)) {
absMessaging.onTopicMsg.addListener(
getTopicName(conduit.currentApp.appId, params[0], targetMethod),
getWrappedCallback(callback)
);
}
else {
dest = isFront ? "webappApiFront" : "webappApi";
data = isFront ? { method: targetMethod, params: params, sender: msgSender, responseId : localMessaging.generateCallbackId() }
: JSON.stringify({ method: targetMethod, params: params });
}
if (dest) {
if (isFront){
if (typeof(paramCallback) === 'function'){
localMessaging.onLocalRequest.addListener(data.responseId, true, getWrappedCallback(callback));
}
else{
localMessaging.onLocalRequest.addListener(data.responseId, false, getWrappedCallback(callback));
}
localMessaging.sendLocalRequest(dest, data);
}
else {
var sendParams = [dest, msgSender, data, getWrappedCallback(callback), targetMethod, params];
if (webAppApiReady)
Function.prototype.apply.call(absMessaging.sendSysReq, this, sendParams);
else
webappApiQueue.push(sendParams);
}
}
}
};
})();
function getFunction(path, params) {
var isFront = webAppApiFront[path];
var paramsLength = params ? params.replace(/\s/g, "").split(",").length : 0,
tempFunc = function(){
var requestParams = new Array(paramsLength + 2);
for(var i=0; i < paramsLength + 2; i++){
requestParams[i] = typeof (arguments[i]) !== 'undefined' ?   arguments[i] : null ;
}
var onError = requestParams.pop(),
onSuccess = requestParams.pop();
if (isFront){
requestParams.push({isFront:true});
}
messaging.sendRequest(path, requestParams, onSuccess, onError);
}
return tempFunc;
}
function convertToFunctions(root, path) {
var obj = {};
for (var pName in root) {
var pPath = (path ? path + "." : "") + pName,
pValue = root[pName];
if (typeof (pValue) === "string") {
obj[pName] = getFunction(pPath, pValue);
}
else if (typeof (pValue) === "object")
obj[pName] = convertToFunctions(pValue, pPath);
}
return obj;
}
//******************* TODO Remove this code when this is fixed in the abstraction layer!!!********************
/* See bug 17330. currently only in IE, all browser events such as F5, mouse in/out using ctrl+weel CTRL + <key> are triggered on the toolbar apps (like embedded).
this affects the toolbar and corrupts it.
this hack must be removed when this is fixed in a more generic way.
*/
var disableKey = function (event){
if (!event) event = window.event;
if (!event) return;
var keyCode = event.keyCode ? event.keyCode : event.charCode;
// 116 == F5
if (keyCode == 116) {
// Standard DOM (Mozilla):
if (event.preventDefault) event.preventDefault();
//IE (exclude Opera with !event.preventDefault):
if (document.all && window.event && !event.preventDefault) {
event.cancelBubble = true;
event.returnValue = false;
event.keyCode = 0;
}
return false;
}
};
var disableWindowEvents = function(){
if (document && document.attachEvent){
document.attachEvent('onkeydown', disableKey);
}
};
disableWindowEvents();
//**************************************************************************************************************
})();
/* developer.js */
function setStorage() {
var proxy;
if (/Firefox/.test(navigator.userAgent)) {
// The abstraction layer uses the following function to attach (sync) storage in FF. This is why it's global.
var storageObj = conduit.storage || conduitStorage;
storageObj.app.keys.get = function (keyName, callback) {
var data = abstractionlayer.commons.repository.getKey(getStorageKey("app", keyName));
data = data ? data.result : undefined;
if (callback) callback(data);
return data;
}
storageObj.global.keys.get = function (keyName, callback) {
var data = abstractionlayer.commons.repository.getKey(getStorageKey("global", keyName));
data = data ? data.result : undefined;
if (callback) callback(data);
return data;
}
storageObj.app.items.get = function (keyName, callback) {
var data = abstractionlayer.commons.repository.getData(getStorageKey("app", keyName));
data = data ? data.result : undefined;
if (callback) callback(data);
return data;
}
storageObj.global.keys.set = function (keyName, data) {
abstractionlayer.commons.repository.setKey(getStorageKey("global", keyName), data);
conduit.advanced.messaging.postTopicMessage("EBGlobalKeyChanged", { keyName: keyName, keyValue: data });
}
storageObj.app.keys.set = function (keyName, data) {
abstractionlayer.commons.repository.setKey(getStorageKey("app", keyName), data);
if (typeof (EBKeyChanged) === "function") {
EBKeyChanged(keyName, data);
}
}
delete window.setStorageProxy;
} else if (/MSIE/.test(navigator.userAgent)) {
conduit.storage.app.keys.get = function (keyName, callback) {
// The fourth parameter is for token!
var data = JSON.parse(window.external.invokePlatformActionLimitedSync(21, 0, getStorageKey("app", keyName), "")).result;
if (callback) callback(data);
return data;
}
conduit.storage.global.keys.get = function (keyName, callback) {
// The fourth parameter is for token!
var data = JSON.parse(window.external.invokePlatformActionLimitedSync(21, 0, getStorageKey("global", keyName), "")).result;
if (callback) callback(data);
return data;
}
conduit.storage.app.items.get = function (keyName, callback) {
var data = JSON.parse(window.external.invokePlatformActionLimitedSync(21, 2, getStorageKey("app", keyName), "")).result;
if (callback) callback(data);
return data;
}
conduit.storage.global.keys.set = function (keyName, data) {
window.external.invokePlatformActionLimitedSync(21, 1, getStorageKey("global", keyName), data);
conduit.advanced.messaging.postTopicMessage("EBGlobalKeyChanged", { keyName: keyName, keyValue: data });
}
conduit.storage.app.keys.set = function (keyName, data) {
window.external.invokePlatformActionLimitedSync(21, 1, getStorageKey("app", keyName), data);
if (typeof (EBKeyChanged) === "function") {
EBKeyChanged(keyName, data);
}
}
}
else if (/Chrome/.test(navigator.userAgent)) {
function getStrData(objData) {
if (!objData.status) {
return unescape(objData.result);
}
else {
return ""
}
}
conduit.storage.app.keys.get = function (keyName, callback) {
try {
var data = JSON.parse(npapiPlugin.getKey(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName))));
if (callback) callback(data);
return getStrData(data);
}
catch (generalException) {
if (window.console)
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
};
conduit.storage.app.items.get = function (keyName, callback) {
try {
var data = JSON.parse(npapiPlugin.getData(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName))));
if (callback) callback(data);
return getStrData(data);
}
catch (generalException) {
if (window.console)
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
};
conduit.storage.global.keys.get = function (keyName, callback) {
try {
var data = JSON.parse(npapiPlugin.getGlobalKey(conduit.currentApp.info.toolbar.cID, getStorageKey("global", encodeURI(keyName))));
if (callback) callback(data);
}
catch (generalException) {
console.error("General Exception BCAPI get global key: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
return getStrData(data);
}
conduit.storage.app.keys.set = function (keyName, data) {
try {
var ret = npapiPlugin.setKey(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName)), escape(data));
if (ret && !ret.status && window.EBKeyChanged) {
EBKeyChanged(keyName, data);
}
return ret;
}
catch (generalException) {
if (window.console)
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
conduit.storage.app.keys.remove = function (keyName) {
try {
var ret = npapiPlugin.removeKey(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName)));
return ret;
}
catch (generalException) {
if (window.console) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
};
conduit.storage.app.items.remove = function (keyName) {
try {
var ret = npapiPlugin.removeData(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName)));
return ret;
}
catch (generalException) {
if (window.console) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
};
conduit.storage.global.keys.remove = function (keyName) {
try {
var ret = npapiPlugin.deleteGlobalKey(conduit.currentApp.info.toolbar.cID, getStorageKey("global", encodeURI(keyName)));
return ret;
}
catch (generalException) {
if (window.console) {
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
};
conduit.storage.global.keys.set = function (keyName, data) {
try {
var ret = npapiPlugin.setGlobalKey(conduit.currentApp.info.toolbar.cID, getStorageKey("global", encodeURI(keyName)), escape(data));
if (ret && !ret.status) {
conduit.advanced.messaging.postTopicMessage("EBGlobalKeyWasChanged", { keyName: keyName, keyValue: data });
}
return ret;
}
catch (generalException) {
if (window.console)
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
conduit.storage.app.items.set = function (keyName, data) {
try {
return npapiPlugin.setData(conduit.currentApp.info.toolbar.cID, getStorageKey("app", encodeURI(keyName)), escape(data));
}
catch (generalException) {
if (window.console)
console.error("General Exception: " + generalException + " " + (generalException.stack ? generalException.stack.toString() : "") + document.location);
}
}
} else if (/Safari/.test(navigator.userAgent)) {
var storageObj = conduit.storage || conduitStorage;
storageObj.app.keys.get = function (keyName, callback) {
var data;
if (window.safari) { //embedded
data = safari.extension.globalPage.contentWindow.conduit.abstractionlayer.commons.repository.getKey(getStorageKey("app", keyName));
}
else { //popup
data = abstractionlayer.commons.repository.getKey(getStorageKey("app", keyName));
}
data = (data && data.status == 0 && data.result) ? data.result : undefined;
if (callback) callback(data);
return data;
}
storageObj.global.keys.get = function (keyName, callback) {
var data;
if (window.safari) { //embedded
data = safari.extension.globalPage.contentWindow.conduit.abstractionlayer.commons.repository.getKey(getStorageKey("global", keyName));
}
else { //popup
data = abstractionlayer.commons.repository.getKey(getStorageKey("global", keyName));
}
data = (data && data.status == 0 && data.result) ? data.result : undefined;
if (callback) callback(data);
return data;
}
storageObj.app.items.get = function (keyName, callback) {
var data;
if (window.safari) { //embedded
data = safari.extension.globalPage.contentWindow.conduit.abstractionlayer.commons.repository.getData(getStorageKey("app", keyName));
}
else { //popup
data = abstractionlayer.commons.repository.getData(getStorageKey("app", keyName));
}
data = (data && data.status == 0 && data.result) ? data.result : undefined;
if (callback) callback(data);
return data;
}
delete window.setStorageProxy;
}
setTimeout(function () {
// Enable EBKeyChanged:
conduit.advanced.messaging.onTopicMessage.addListener("EBGlobalKeyChanged", function (data) {
if (typeof (EBGlobalKeyChanged) === "function") {
EBGlobalKeyChanged(data.keyName, data.keyValue);
}
});
}, 1);
}
if (conduitStorage.app.getItem) {
conduit.storage.app.getItem = conduitStorage.app.getItem;
conduit.storage.global.getItem = conduitStorage.global.getItem;
}
storagePrefix.app = conduit.currentApp.id + "_";
storagePrefix.global = conduit.currentApp.info.toolbar.id + ".";
storagePrefix.app = storagePrefix.global + conduit.currentApp.appId + ".";
setStorage();
/* End developer.js */
/* bc_api.js */
var allTargets,
that = this,
targetHandlers = {
tab: function (href) {
conduit.tabs.create({ url: href });
},
main: function (href) {
conduit.tabs.update(String(data.currentTab.tabId), { url: href });
},
top: function (href) {
window.top.document.location.href = href;
},
parent: function (href) {
parent.document.location.href = href;
},
"new": function (href) {
conduit.windows.create({ url: href });
},
blank: function (href) {
conduit.tabs.create({ url: href });
},
self: function (href) {
that.selfNavigate(href);
}
};
document.onclick = function (e) {
e = e || window.event;
var targetElement = e.target || e.srcElement,
targetRegex = /(?:#_(main)|(top)|(parent)|(new)|(blank)|(tab))$/i;
if (targetElement.nodeName !== "A")
return true;
if (allTargets) {
targetHandlers[allTargets](targetElement.href);
return false;
}
var hrefMatch = targetElement.href.match(targetRegex);
if (hrefMatch) {
targetHandlers[hrefMatch[0]](targetElement.href.replace("#_" + hrefMatch[0], ""));
return false;
}
};
var info = conduit.currentApp.info,
data = {
info: {
appId: info.appId || info.app.appId,
context: {
embedLocation: conduit.currentApp.context === "embedded" ? "Embedded App" : "Gadget",
host: "Toolbar",
origin: conduit.currentApp.isUserApp ? "User" : "Publisher"
},
general: {
browser: info.platform.browser,
browserVersion: info.platform.browserVersion,
OS: info.platform.OS,
OSVersion: info.platform.OSVersion,
toolbarName: info.toolbar.name,
toolbarVersion: info.toolbar.version,
toolbarLocale: info.platform.locale
},
size: {
width: getWidth(),
height: getHeight()
}
},
currentTab: info.tabInfo
};
setTimeout(function () {
conduit.tabs.onSelectionChanged.addListener(function () {
conduit.tabs.getSelected(null, function (tabInfo) {
data.currentTab = tabInfo;
if (typeof (EBTabChange) === "function"){
EBTabChange(tabInfo.url);
}
});
});
conduit.tabs.onRemoved.addListener(function (tabInfo) {
if (typeof (EBTabClose) === "function")
EBTabClose(tabInfo);
});
conduit.tabs.onDocumentComplete.addListener(function (tabInfo, isMainFrame) {
data.currentTab = tabInfo;
if (isMainFrame !== false && typeof (EBDocumentComplete) === "function")
EBDocumentComplete(tabInfo.url, tabInfo.tabId);
});
conduit.tabs.onNavigateComplete.addListener(function (tabInfo) {
if (typeof (EBNavigateComplete) === "function")
EBNavigateComplete(tabInfo.url, tabInfo.tabId);
});
// Initial search term (might have to add the current window here later):
conduit.platform.search.getTerm(function (term) {
data.currentSearchTerm = term;
});
conduit.platform.search.onTextChanged.addListener(function (term) {
data.currentSearchTerm = term;
if (typeof (EBSearchTermChanged) === "function") {
EBSearchTermChanged();
}
});
conduit.tabs.onRequest.addListener("callBackToAppThroughAppToTabCommunication",function(data){
if(window.EBCallBackMessageReceived)
window.EBCallBackMessageReceived(data);
});
}, 1);
function updateSize() {
data.info.size = {
width: getWidth(),
height: getHeight()
};
}
function fixHeightOnOpen(height, titlebarEnabled, resizeEnabled) {
if (navigator.userAgent.indexOf("Firefox") != -1) {
if (!titlebarEnabled) {
height += 25;
}
if (!resizeEnabled) {
height += 15;
}
} else if (navigator.userAgent.indexOf("MSIE") != -1) {
if (titlebarEnabled) {
height -= 25;
}
if (resizeEnabled) {
height -= 15;
}
}
return height;
}
function fixHeightOnResize(height, titlebarEnabled, resizeEnabled) {
if (navigator.userAgent.indexOf("Firefox") != -1) {
if (!document.title) {
height += 25;
}
if (!resizeEnabled) {
height += 15;
}
} else if (navigator.userAgent.indexOf("MSIE") != -1) {
if (titlebarEnabled) {
height -= 25;
}
if (resizeEnabled) {
height -= 15;
}
}
return height;
}
function fixHeightOnGetHeight(height, titlebarEnabled, resizeEnabled) {
if (navigator.userAgent.indexOf("MSIE") != -1) {
if (titlebarEnabled) {
height += 25;
}
if (resizeEnabled) {
height += 15;
}
}
return height;
}
function fixWidth(width, isSet) {
return width; // this function was created for IE backward compitibility - no longer needed
if (navigator.userAgent.indexOf("MSIE") != -1){
if (isSet){
width += 12;
}
else{ // from get, return the expected value to user
width -= 12;
}
}
return width;
}
if (window.addEventListener) {
window.addEventListener("load", updateSize, false);
window.addEventListener("resize", updateSize, false);
}
else {
window.attachEvent('onload', updateSize);
window.attachEvent("onresize", updateSize);
}
this.changeHeight = function (newHeight) {
var featuresObj = getFeaturesObj(RetrieveKey("APP_WIN_FEATURES"));
var isTitleEnabled = featuresObj.titlebar;
var isResizeEnabled = featuresObj.resizable;
if (conduit.currentApp.context === "popup") {
conduit.app.popup.resize(null,{ height: fixHeightOnResize(parseInt(newHeight, 10), isTitleEnabled, isResizeEnabled), width: -1 });
}
else{
if (navigator.userAgent.indexOf("Firefox") != -1) {
document.body.style.marginTop = (28 - newHeight) / 2 + "px";
window.isHeightChangedByUser = true;
}
}
};
this.changeSize = function (newWidth, newHeight) {
var featuresObj = getFeaturesObj(RetrieveKey("APP_WIN_FEATURES"));
var isTitleEnabled = featuresObj.titlebar;
var isResizeEnabled = featuresObj.resizable;
if (conduit.currentApp.context === "popup") {
conduit.app.popup.resize(null,{ width: parseInt(newWidth, 10), height: fixHeightOnResize(parseInt(newHeight, 10), isTitleEnabled, isResizeEnabled) });
}
};
this.changeWidth = function (newWidth) {
if (conduit.currentApp.context === "embedded")
conduit.app.embedded.setEmbedded({ width: fixWidth(parseInt(newWidth, 10), true) });
else if (conduit.currentApp.context === "popup") {
conduit.app.popup.resize(null,{ width: parseInt(newWidth, 10), height: -1 });
}
};
this.closeWindow = function () {
conduit.app.popup.close();
};
this.crossDomainHttpRequest = function (callbackHashKey, method, url, postParams, userName, password, headersArr) {
conduit.network.httpRequest({
method: method,
url: url,
postParams: postParams,
userName: userName,
password: password,
headers: headersArr
}, function (response,headers,code){_BCAPIHelper.callbacksHash[callbackHashKey](response,code,headers)});
};
this.deleteKey = function (key) { conduit.storage.app.keys.remove(key); };
this.deleteFile = function (key) { conduit.storage.app.items.remove(key); };
this.deleteGlobalKey = function (key) { conduit.storage.global.keys.remove(key); };
this.getDownloadPageUrl = function () { return info.toolbar.downloadUrl; };
this.executeApplication = function (registeredName, parameters, appNotFoundUrl) {
conduit.platform.executeExternalProgram(registeredName, parameters, function () { }, function () {
if (appNotFoundUrl) {
conduit.tabs.create({ 'url': appNotFoundUrl }, function () { });
}
});
};
function getWidth() {
return window.innerWidth ? window.innerWidth : document.documentElement ? document.documentElement.offsetWidth : undefined;
}
function getHeight() {
//var featuresObj = getFeaturesObj(RetrieveKey("APP_WIN_FEATURES"));
// roee ovadia 12.12.11 check if embeded app return null object;
var featuresObj = conduit.currentApp.context === "embedded" ? {} : getFeaturesObj(conduit.storage.app.keys.get("APP_WIN_FEATURES"));
var isTitleEnabled = featuresObj.titlebar;
var isResizeEnabled = featuresObj.resizable;
var height;
if (navigator.userAgent.indexOf("MSIE") != -1) {
height = window.innerHeight ? fixHeightOnGetHeight(window.innerHeight, isTitleEnabled, isResizeEnabled) : document.documentElement ? fixHeightOnGetHeight(document.documentElement.offsetHeight, isTitleEnabled, isResizeEnabled) : undefined;
} else {
height = window.innerHeight ? window.innerHeight : document.documentElement ? document.documentElement.offsetHeight : undefined;
}
return height;
}
this.getWidth = function () {
var currentWidth = getWidth();
if (currentWidth && this.embeddedWidthChangedByUser){//ofir
currentWidth = fixWidth(currentWidth, false);
}
return currentWidth;
};
this.getHeight = function () {
return getHeight();
};
this.getInfo = function () {
data.info.componentId = data.info.appId;
return JSON.stringify(data.info);
};
this.getMainFrameTitle = function () {
return (data && data.currentTab && data.currentTab.title) ? data.currentTab.title : "";
};
this.getMainFrameUrl = function () {
return (data && data.currentTab && data.currentTab.url) ? data.currentTab.url : "";
};
this.getSearchTerm = function () { return data.currentSearchTerm; };
this.getToolbarId = function () { return info.toolbar.id; };
this.getToolbarName = function () { return info.toolbar.name; };
this.getVersion = function () { return info.toolbar.version; };
this.handleHeight = function () { };
this.injectScript = function (strScript, tabId, allFrames) {
if (!tabId) {
tabId = data && data.currentTab ? data.currentTab.tabId : null;
};
if (~strScript.indexOf("EBCallBackMessageReceived")) {
conduit.tabs.executeScript(tabId || null, { code: "function EBCallBackMessageReceived(data) { conduitPage.sendRequest('callBackToAppThroughAppToTabCommunication', data); }" });
}
conduit.tabs.executeScript(tabId || null, { code: strScript, allFrames: allFrames });
return true;
};
this.isAppInstalled = function (guid) {
// need to implement installed apps, synchronously.
};
this.loadFile = function (name) { return conduit.storage.app.items.get(name) || null; };
this.navigateInFrame = function (url, frameId) {
document.getElementById(frameId).src = url+"#_self";
};
this.navigateInMainFrame = function (url) {
conduit.tabs.update(String(data.currentTab.tabId), { url: url });
};
this.navigateInNewTab = function (url) {
conduit.tabs.create({ url: url });
};
this.navigateInTab = function (url,tabId) {
conduit.tabs.update(String(tabId),{ url: url });
};
this.openGadget3 = function (url, width, height, features) {
var featuresObj = getFeaturesObj(features);
if (window.chrome && featuresObj.nativeframe){
if (window.top) {
window.top.open(url);
} else {
window.open(url);
}
return;
}
conduit.app.popup.open(url, {dimensions:{
width: width,
height: height},
showFrame: featuresObj.titlebar,
closeOnExternalClick: featuresObj.closeonexternalclick,
saveLocation: featuresObj.openposition ? false : featuresObj.savelocation,
openPosition: featuresObj.openposition,
nativeFrame: featuresObj.nativeframe,
allowScrolls: {hScroll: featuresObj.hscroll !== false, vScroll: featuresObj.vscroll !== false},
closebutton: featuresObj.closebutton,
resizable: featuresObj.resizable,
saveSize: featuresObj.saveresizedsize
});
};
function getFeaturesObj (features) {
if (!features) {
return {};
}
var featuresObjStr = features.split(/(?:\s+)?,(?:\s+)?/g);
var featuresObj = {};
for (var i = 0, count = featuresObjStr.length; i < count; i++) {
var nameValue = featuresObjStr[i].split(/(?:\s+)?=(?:\s+)?/);
if (nameValue.length === 2) {
var isBooleanVal = !! ~["1", "0", "yes", "no"].indexOf(nameValue[1]);
featuresObj[nameValue[0]] = isBooleanVal ? !! ~["1", "yes"].indexOf(nameValue[1]) : nameValue[1];
}
}
return featuresObj;
};
this.openGadget2 = function (url, width, height, features) {
StoreKey("APP_WIN_FEATURES", features);
var featuresObj = getFeaturesObj(features);
height = fixHeightOnOpen(height, featuresObj.titlebar, featuresObj.resizable, true);
if (window.chrome && featuresObj.nativeframe){
if (window.top) {
window.top.open(url);
} else {
window.open(url);
}
return;
}
function fixOffset(offset){
if (!offset){
return null;
}
var offsetMatch = offset.match(/^offset\s?:?\((\-?\d+)[,|;]\s?(\-?\d+)\)$/i);
if (offsetMatch){
return ("offset("+ parseInt(offsetMatch[1], 10)+","+parseInt(offsetMatch[2], 10)-28+")");
}
return "";
}
conduit.app.popup.open(url, {dimensions:{
width: width,
height: height},
showFrame: featuresObj.titlebar,
closeOnExternalClick: featuresObj.closeonexternalclick,
saveLocation: featuresObj.openposition ? false : featuresObj.savelocation,
openPosition: fixOffset(featuresObj.openposition),
nativeFrame: featuresObj.nativeframe,
allowScrolls: {hScroll: featuresObj.hscroll !== false, vScroll: featuresObj.vscroll !== false},
closebutton: featuresObj.closebutton,
resizable: featuresObj.resizable,
saveSize: featuresObj.saveresizedsize
});
};
this.refreshComponentById = function (componentId) { conduit.platform.refreshApp(componentId); };
this.refreshToolbar = function () { conduit.platform.refresh(); };
this.registerForMessaging = function (key) {
conduit.messaging.onTopicMessage.addListener(key, function (data) {
if (window.EBMessageReceived) {
window.EBMessageReceived(key, data);
}
});
};
this.retrieveKey = function (keyName) {
return conduit.storage.app.keys.get(keyName) || null;
};
this.retrieveGlobalKey = function (keyName) {
return conduit.storage.global.keys.get(keyName) || null;
};
this.selfNavigate = function (url, newWidth) {
if (conduit.currentApp.context === "embedded")
conduit.app.embedded.setEmbedded({ url: url, width: newWidth });
else if (conduit.currentApp.context === "popup"){
var queryPrefix = ~url.indexOf("#") ? "&" : "#";
document.location.href = url + queryPrefix + "appData=" + encodeURIComponent(JSON.stringify(conduit.currentApp)) + "&___requireStorage";
}
};
this.sendInstantAlertByHtml2  = function (strTitle, logoUrl, strHtml, notificationLengthSeconds){
var dataObj = {
icon:logoUrl,
title:strTitle,
content:strHtml,
notificationLengthSeconds: notificationLengthSeconds
}
conduit.notifications.showNotification(dataObj);
};
this.sendMessage = function (key, data) {
conduit.messaging.postTopicMessage(key, data);
conduit.tabs.executeScript(null,{ code: "__EBonMessageReceived('"+conduit.currentApp.info.toolbar.id+"','"+key+"','"+data+"');"  , injectToolbarApiMessage: true});
};
this.storeKey = function (key, value) { conduit.storage.app.keys.set(key, value); };
this.saveFile = function (name, content) { conduit.storage.app.items.set(name, content); };
this.setLinksTarget = function (target) {
if (! ~["_new", "_tab", "_main", "_self"].indexOf(target))
target = "_self";
allTargets = target.replace("_", "");
};
this.setSkin = function (skinObj) {
if (!skinObj){
skinObj = {'background':{'color':'transparent'}};
}
else{
skinObj = JSON.parse(skinObj);
}
conduit.platform.setSkin(skinObj);
};
this.storeGlobalKey = function (key, value) { conduit.storage.global.keys.set(key, value); };
}
smartbarBcApiObj = new smartbarBcApi();
}
var communicator = smartbarBcApiObj;
communicator.isSupportedFunction = function (functionName) {
return (communicator[functionName])
}
BcApi.call(this, communicator);
}
SmartBar_BcApi.prototype = new BcApi();
SmartBar_BcApi.constructor = SmartBar_BcApi;
//**********************************  SMART_BAR END  **********************************\\
