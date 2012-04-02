﻿/* 3.4.1.10 */

if (typeof STILL_LODING_TEXT === "undefined") {
    var STILL_LODING_TEXT = "Still loading...";
    var ERROR_CODE_PERMISSION_DENIED = 20;
    var EBJSON = {};
    if (!("JSON" in window)) {
        EBJSON = {
            stringify: function (aJSObject, aKeysToDrop) {
                var pieces = [];

                function append_piece(aObj) {
                    if (typeof aObj == "string") {
                        aObj = aObj.replace(/[\\"\x00-\x1F\u0080-\uFFFF]/g, function ($0) {
                            switch ($0) {
                                case "\b": return "\\b";
                                case "\t": return "\\t";
                                case "\n": return "\\n";
                                case "\f": return "\\f";
                                case "\r": return "\\r";
                                case '"': return '\\"';
                                case "\\": return "\\\\";
                            }
                            return "\\u" + ("0000" + $0.charCodeAt(0).toString(16)).slice(-4);
                        });
                        pieces.push('"' + aObj + '"')
                    }
                    else if (typeof aObj == "boolean") {
                        pieces.push(aObj ? "true" : "false");
                    }
                    else if (typeof aObj == "number" && isFinite(aObj)) {
                        pieces.push(aObj.toString());
                    }
                    else if (aObj === null) {
                        pieces.push("null");
                    }
                    else if (aObj instanceof Array ||
                typeof aObj == "object" && "length" in aObj &&
                (aObj.length === 0 || aObj[aObj.length - 1] !== undefined)) {
                        pieces.push("[");
                        for (var i = 0; i < aObj.length; i++) {
                            arguments.callee(aObj[i]);
                            pieces.push(",");
                        }
                        if (aObj.length > 0)
                            pieces.pop(); // drop the trailing colon
                        pieces.push("]");
                    }
                    else if (typeof aObj == "object") {
                        pieces.push("{");
                        for (var key in aObj) {
                            // allow callers to pass objects containing private data which
                            // they don't want the JSON string to contain (so they don't
                            // have to manually pre-process the object)
                            if (aKeysToDrop && aKeysToDrop.indexOf(key) != -1)
                                continue;

                            arguments.callee(key.toString());
                            pieces.push(":");
                            arguments.callee(aObj[key]);
                            pieces.push(",");
                        }
                        if (pieces[pieces.length - 1] == ",")
                            pieces.pop(); // drop the trailing colon
                        pieces.push("}");
                    }
                    else {
                        throw new TypeError("No JSON representation for this object!");
                    }
                }
                append_piece(aJSObject);

                return pieces.join("");
            },

            /**
            * Converts a JSON string into a JavaScript object.
            *
            * @param aJSONString is the string to be converted
            * @return a JavaScript object for the given JSON representation
            */
            parse: function (aJSONString) {
                if (!this.isMostlyHarmless(aJSONString))
                    throw new SyntaxError("No valid JSON string!");

                return eval("(" + aJSONString + ")");
            },

            /**
            * Checks whether the given string contains potentially harmful
            * content which might be executed during its evaluation
            * (no parser, thus not 100% safe! Best to use a Sandbox for evaluation)
            *
            * @param aString is the string to be tested
            * @return a boolean
            */
            isMostlyHarmless: function (aString) {
                var maybeHarmful = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/;
                var jsonStrings = /"(\\.|[^"\\\n\r])*"/g;

                return !maybeHarmful.test(aString.replace(jsonStrings, ""));
            }
        };
    }
    else {
        EBJSON = JSON;
    }

    var _RegistredToolbars =
{
    arrToolbars: new Array(),
    hashToolbars: new Object(),
    registeredTopicHash: {},

    addToolbar: function (objProxy) {
        if (this.hashToolbars[objProxy.ctid]) return;

        this.arrToolbars.push(objProxy);
        this.hashToolbars[objProxy.ctid] = objProxy;
    },

    removeToolbar: function (ctid) {
        if (!this.hashToolbars[ctid]) return;

        this.hashToolbars[ctid] = null;
        for (var i = 0; i < this.arrToolbars.length; i++) {
            if (typeof (this.arrToolbars[i].ctid) == "undefined" || this.arrToolbars[i].ctid == ctid) {
                this.arrToolbars.splice(i, 1);
                break;
            }
        }
    },

    isRegistred: function (ctid) {
        return (this.hashToolbars[ctid]) ? true : false;
    },

    getToolbar: function (ctid) {
        return (this.isRegistred(ctid)) ? this.hashToolbars[ctid] : null;
    },

    getAllToolbars: function () {
        return this.arrToolbars;
    }
};

    function _TPIRegisterToolbarIE(activeXName) {
        try {
            var objProxy = new ActiveXObject(activeXName);
            _RegistredToolbars.addToolbar(objProxy);
        }
        catch (ex) { }
    };

    function _TPIRegisterToolbarFF(objProxy) {
        _RegistredToolbars.addToolbar(objProxy);
    };

    function _TPIUnregisterToolbar(ctid) {
        _RegistredToolbars.removeToolbar(ctid);
    };

    //Toolbar API
    //FF - this class is overridden by toolbar.
    //IE - this class catches all the calls IE didn't catch.

    var BROWSERS_DEF =
{
    IE6: "IE6",
    IE7: "IE7",
    FF: "FF",
    SAFARI: "SAFARI",
    WEBKIT: "WEBKIT" // Chrome or Safari web toolbars
};

    var __TPI =
{
    Result: "",

    ResetResult: function () {
        this.Result = "";
    },

    SetResult: function (strResult) {
        this.Result += strResult;
    },

    GetResult: function (bIsMultipleResponse) {
        return _TPIHelper.GetResult(this.Result, bIsMultipleResponse);
    },

    ExecuteApiFunction: function (strFuncName, strParam) {
        //do nothing
    }
};

    //for Safari MAC
    var _TPI;
    var isSafari;

    if (typeof TPIObject != "undefined") {
        _TPI = TPIObject;
        isSafari = true;
    }
    else {
        _TPI = __TPI;
        isSafari = false;
    }

    //Wrapped JS function for IE to return Result
    function _TPISetResult(strXmlResult) {
        _TPI.SetResult(strXmlResult);
    };

    //Helper object with service functions for interaction with the toolbar.
    var _TPIHelper =
{
    IsSupportedFunction: "IsSupportedFunction",

    GetBrowser: function () {
        if (isSafari) return BROWSERS_DEF.SAFARI;

        var strAgent = navigator.userAgent;
        //IE
        if (strAgent.indexOf("MSIE") != -1) {
            //Try with regex to overcome the bug with multiple data in user agent
            var result = strAgent.match(/MSIE (\d*)/);
            if (result && result.length >= 2) {
                if (parseInt(result[1]) == 6)
                    return BROWSERS_DEF.IE6;
                else
                    return BROWSERS_DEF.IE7;
            }
            else {
                if (strAgent.indexOf("MSIE 6.") != -1)
                    return BROWSERS_DEF.IE6;
                //IE7
                else
                    return BROWSERS_DEF.IE7;
            }
        }
        else if (strAgent.match(/webkit.*?(chrome|safari)/i) !== null) {
            var tbIframe = document.getElementsByClassName("TOOLBAR_IFRAME");
            var tbIframe = tbIframe && tbIframe.length ? tbIframe[0] : tbIframe;
            var isSB = true;
            if (tbIframe && tbIframe.id && tbIframe.id.indexOf("T_") === 0) {
                isSB = false;
            }
            if (document.getElementById("main-iframe-wrapper") && isSB) {
                return BROWSERS_DEF.FF;
            }
            else {
                return BROWSERS_DEF.WEBKIT;
            }
        }
        else
        //FF - because safari is detected earlier.
            return BROWSERS_DEF.FF;
    },

    _normalizeArgs: function (args) {
        for (var i = 0; i < args.length; i++) {
            if (args[i] && args[i].replace) {
                args[i] = args[i].replace(/\\/g, "\\\\");
                args[i] = args[i].replace(/'/g, "\\'");
            }
        }
    },

    _ExecuteOldWay: function (args, ctid) {
        if (ctid) args.push(ctid);
        var strBrowser = this.GetBrowser();
        switch (strBrowser) {
            case BROWSERS_DEF.IE7:
                var frameSrc = "about:blank#javascript:" + "_TPI.ExecuteApiFunction('" + args.join("','") + "')";
                this.NavigateInIFrame(frameSrc);
                break;
            case BROWSERS_DEF.IE6:
                document.location.href = "javascript:" + "_TPI.ExecuteApiFunction('" + args.join("','") + "')";
                break;
            case BROWSERS_DEF.SAFARI:
                this._normalizeArgs(args);
                _TPI.ExecuteApiFunction(args.join("','"));
                break;
            case BROWSERS_DEF.FF:
                this._normalizeArgs(args);
                eval("_TPI.ExecuteApiFunction('" + args.join("','") + "')");
                break;
        }
    },

    //This function interacts directly with toolbar, by calling JS functions,
    //which IE interprets as navigation, and FF gets the function itself.
    //args :        [0] -       function name
    //              [2]..[n]    function arguments
    ExecuteFunctionSingle: function (args, ctid) {
        if (this.GetBrowser() === BROWSERS_DEF.WEBKIT) { // Chrome or Safari web toolbars

            var toolbarInfo = ToolbarInfosObject[ctid];
            var returnObj = toolbarInfo || {};
            if (toolbarInfo !== undefined) {
                var event = {
                    'name': 'ExecuteFunctionSingle',
                    'data': arguments,
                    'sourceAPI': 'ToolbarApi',
                    'targetAPI': 'ToolbarApi'
                };

                // post message to injected script (same domain)
                window.postMessage(JSON.stringify(event), document.location.origin);

                returnObj.errorCode = 1;
                returnObj.returnValue = true;
            }
            else { // Toolbar is not installed
                returnObj.errorCode = 0;
                returnObj.returnValue = false;
            }

            return returnObj;
        }
        else {
            _TPI.ResetResult();

            //check if toolbar is registered via new register toolbar mechanism (both IE & FF)
            var objProxy = _RegistredToolbars.getToolbar(ctid);
            if (objProxy) {
                var result = objProxy.ExecuteApiFunction(args);
                _TPI.SetResult(result);
            }
            else
                this._ExecuteOldWay(args, ctid);

            return _TPI.GetResult(false);
        }
    },

    ExecuteFunctionMultiple: function (args) {
        if (this.GetBrowser() === BROWSERS_DEF.WEBKIT) { // Chrome or Safari web toolbars

            // Realcommerce code here

            return {
                returnValue: true,
                errorCode: 1
            };
        }
        else {
            _TPI.ResetResult();

            this._ExecuteOldWay(args);

            var arrAllToolbars = _RegistredToolbars.getAllToolbars();
            if (arrAllToolbars.length != 0) {
                var objProxy = null;
                var result = "";
                for (var i = 0; i < arrAllToolbars.length; i++) {
                    objProxy = arrAllToolbars[i];
                    result = objProxy.ExecuteApiFunction(args);
                    _TPI.SetResult(result);
                }
            }

            return _TPI.GetResult(true);
        }
    },

    ExecuteFunctionAny: function (args) {
        if (this.GetBrowser() === BROWSERS_DEF.WEBKIT) { // Chrome or Safari web toolbars

            // Realcommerce code here

            return {
                returnValue: true,
                errorCode: 1
            };
        }
        else {
            _TPI.ResetResult();

            var arrAllToolbars = _RegistredToolbars.getAllToolbars();
            var isDone = false;
            if (arrAllToolbars.length != 0) {
                var objProxy = null;
                var strResult = "";
                var oResult = null;
                for (var i = 0; i < arrAllToolbars.length; i++) {
                    objProxy = arrAllToolbars[i];
                    strResult = objProxy.ExecuteApiFunction([this.IsSupportedFunction, args[0]]);
                    oResult = this.GetResult(strResult, false);
                    if (oResult.returnValue) {
                        strResult = objProxy.ExecuteApiFunction(args);
                        _TPI.SetResult(strResult);
                        isDone = true;
                        break;
                    }
                }
            }

            //if no toolbars registered or non of the registred toolbars supports this function, 
            //execute it the old way, for older toolbars
            if (!isDone)
                this._ExecuteOldWay(args);

            return _TPI.GetResult(true);
        }
    },

    NavigateInIFrame: function (frameSrc) {
        var arrBody = document.getElementsByTagName('body');
        iFrame = document.createElement('iframe');
        iFrame.setAttribute("width", "0");
        iFrame.setAttribute("height", "0");
        arrBody[0].appendChild(iFrame);
        iFrame.src = frameSrc;
        arrBody[0].removeChild(iFrame);
    },

    //Parse Result XML
    //If bIsMultipleResponse = true, return array of objects, each contains response from specific toolbar.
    GetResult: function (strResult, bIsMultipleResponse) {
        var oResult = new Object();
        var arrResult = null;

        if (strResult != "") {
            strResult = "<ROOT>" + strResult + "</ROOT>";
            var oRootXML = null;
            var bIsMulty = false;

            if (window.ActiveXObject) {
                oRootXML = new ActiveXObject("Microsoft.XMLDOM");
                oRootXML.async = "false";
                oRootXML.loadXML(strResult);
                oRootXML = oRootXML.documentElement;
            }
            else {
                var parser = new DOMParser();
                oRootXML = parser.parseFromString(strResult, "text/xml");
                oRootXML = oRootXML.documentElement;
            }

            if (oRootXML.childNodes.length > 1 || bIsMultipleResponse) {
                bIsMulty = true;
                arrResult = new Array();
            }

            for (var z = 0; z < oRootXML.childNodes.length; z++) {
                oXML = oRootXML.childNodes[z];
                if (typeof (oXML.tagName) != "undefined") {
                    //Convert Result XML to an Object
                    for (var i = 0; i < oXML.childNodes.length; i++) {
                        switch (oXML.childNodes[i].tagName) {
                            case "RETURN_VALUE": oResult.returnValue = this.GetBooleanValue(this.GetXMLNodeValue(oXML.childNodes[i])); break;
                            case "ERROR_CODE": oResult.errorCode = this.GetXMLNodeValue(oXML.childNodes[i]); break;
                            case "DATA": var oXmlNode = oXML.childNodes[i];
                                this.DataFactory(oResult, oXmlNode);
                                break;
                            default: break;
                        }
                    }

                    if (bIsMulty) {
                        arrResult.push(oResult);
                        oResult = new Object();
                    }
                }
            }
            if (bIsMulty) {
                oResult = arrResult;
            }
        }
        else {
            oResult.returnValue = false;
            oResult.errorCode = 0;
        }
        return oResult;
    },

    //Function which transfers string TRUE or FALSE into boolean.
    GetBooleanValue: function (strBool) {
        var bBool = (strBool.toLowerCase() == "true") ? true : false;
        return bBool;
    },

    //Factory for parsing data node from toolbar's response.
    DataFactory: function (oData, oXmlNode) {
        //patch for new dual package, toolbar is mystuff enabled, but uncapable to receive apps (only engine can)
        var self = this;
        var isDisableMyStuffByTBVersion = function (version) {
            var arrVersion = version.split(".");
            if (arrVersion.length == 0) //something went wrong
                return false;

            var majorVersion = parseInt(arrVersion[0]);
            var minorVersion = parseInt(arrVersion[0] + arrVersion[1] + arrVersion[2]);
            if (isNaN(majorVersion) || isNaN(minorVersion))  //something went wrong
                return false;

            var strBrowser = self.GetBrowser();
            switch (strBrowser) {
                case BROWSERS_DEF.IE7:
                case BROWSERS_DEF.IE6:
                    return (majorVersion >= 6 && minorVersion < 640);
                case BROWSERS_DEF.SAFARI: return false;
                case BROWSERS_DEF.FF:
                    return (majorVersion >= 3 && minorVersion < 334);
            }
        };

        var xmlNode = null;

        for (var j = 0; j < oXmlNode.childNodes.length; j++) {
            xmlNode = oXmlNode.childNodes[j];
            switch (xmlNode.tagName) {
                //Toolbar info                                                                                            
                case "TOOLBAR_INFO":
                    for (var i = 0; i < xmlNode.childNodes.length; i++) {
                        switch (xmlNode.childNodes[i].tagName) {
                            case "VERSION": oData.version = this.GetXMLNodeValue(xmlNode.childNodes[i]); break;
                            case "NAME": oData.name = this.GetXMLNodeValue(xmlNode.childNodes[i]); break;
                            case "CURRENT_CTID": oData.CTID = this.GetXMLNodeValue(xmlNode.childNodes[i]); break;
                            case "ORIGINAL_CTID": oData.originalCTID = this.GetXMLNodeValue(xmlNode.childNodes[i]); break;
                            case "IS_MULTICOMMUNITY": oData.isMulticommunity = this.GetBooleanValue(this.GetXMLNodeValue(xmlNode.childNodes[i])); break;
                            case "IS_GROUPING": oData.isGrouping = this.GetBooleanValue(this.GetXMLNodeValue(xmlNode.childNodes[i])); break;
                            case "IS_CONDUIT_APPS_TOOLBAR": oData.isConduitAppsToolbar = this.GetBooleanValue(this.GetXMLNodeValue(xmlNode.childNodes[i])); break;
                            case "IS_NEW_ADD_MY_STUFF_COMPONENT": oData.isNewAddMystuffComponent = this.GetBooleanValue(this.GetXMLNodeValue(xmlNode.childNodes[i])); break;
                            //new myStuff feature, status                                                                           
                            // 0: disabled,                                                                           
                            // 1: enabled                                                                           
                            //-1: unsupported                                                                           
                            case "MY_STUFF_STATUS": oData.myStuffStatus = parseInt(this.GetXMLNodeValue(xmlNode.childNodes[i])); break;
                            default: break;
                        }
                    }

                    if (isDisableMyStuffByTBVersion(oData.version))
                        oData.myStuffStatus = 0;
                    else if (typeof oData.myStuffStatus == "undefined")
                        oData.myStuffStatus = -1;

                    break;
                //Single value                                                                                            
                case "SINGLE_VALUE":
                    oData.data = this.GetXMLNodeValue(xmlNode);
                    break;
                //Menus info                                                                                            
                case "MENUS_INFO":
                    oData.menusInfo = new Array();
                    for (var i = 0; i < xmlNode.childNodes.length; i++) {
                        var xmlNodeMenu = xmlNode.childNodes[i];
                        if (xmlNodeMenu.tagName == "MENU_INFO") {
                            var oDataMenu = new Object();
                            for (var k = 0; k < xmlNodeMenu.childNodes.length; k++) {
                                switch (xmlNodeMenu.childNodes[k].tagName) {
                                    case "COMP_ID": oDataMenu.componentID = this.GetXMLNodeValue(xmlNodeMenu.childNodes[k]); break;
                                    case "CAPTION": oDataMenu.caption = this.GetXMLNodeValue(xmlNodeMenu.childNodes[k]); break;
                                    case "ICON_URL": oDataMenu.iconUrl = this.GetXMLNodeValue(xmlNodeMenu.childNodes[k]); break;
                                    default: break;
                                }
                            }
                            oData.menusInfo.push(oDataMenu);
                        }
                    }
            }
        }
    },

    GetOldApiResult: function (bResult) {
        var oResult = new Object();
        oResult.returnValue = bResult;
        oResult.errorCode = 0;
        return oResult;
    },

    //Cross browser.
    GetXMLNodeValue: function (xmlNode) {
        if (xmlNode.text) {
            return xmlNode.text;
        }
        else if (xmlNode.childNodes.length != 0) {

            return xmlNode.childNodes[0].nodeValue;
        }
        else {
            return "";
        }
    },

    ToLegalXML: function (strXML) {
        strXML = strXML.replace(/&/g, '&amp;');
        strXML = strXML.replace(/</g, '&lt;');
        strXML = strXML.replace(/>/g, '&gt;');
        strXML = strXML.replace(/\'/g, '&apos;');
        strXML = strXML.replace(/\"/g, '&quot;');

        return strXML;
    },

    //Returns correct XML defining toolbar button
    BuildButtonXml: function (buttonLabel, buttonIcon, buttonTooltip, xmlData,
					   optionsDisplayText, optionsDisplayIcon, uniqueComponentID) {
        var strXML = '<BUTTON>';
        strXML += '<PERMISSIONS><EDIT>True</EDIT><MOVE>True</MOVE><DELETE>True</DELETE></PERMISSIONS>';
        strXML += '<USER_ATTRIBUTES><PERMISSION>FULL</PERMISSION><SHOW_IN_CHEVRON>True</SHOW_IN_CHEVRON></USER_ATTRIBUTES>';
        strXML += '<UNIQUE_COMP_ID>' + this.ToLegalXML(uniqueComponentID) + '</UNIQUE_COMP_ID>';
        strXML += '<DEFAULT_BUTTON_TEXT>' + this.ToLegalXML(buttonLabel) + '</DEFAULT_BUTTON_TEXT>';
        strXML += '<BUTTON_ICON_URL>' + this.ToLegalXML(buttonIcon) + '</BUTTON_ICON_URL>';
        strXML += '<BUTTON_TOOLTIP>' + this.ToLegalXML(buttonTooltip) + '</BUTTON_TOOLTIP>';
        //options display text/icon
        strXML += '<DISPLAY_TEXT>' + this.ToLegalXML(optionsDisplayText) + '</DISPLAY_TEXT>';
        strXML += '<DISPLAY_ICON>' + this.ToLegalXML(optionsDisplayIcon) + '</DISPLAY_ICON>';
        //data node
        strXML += xmlData;
        strXML += '</BUTTON>';

        return strXML;
    },

    //Returns correct XML defining toolbar RSS component
    BuildRssXml: function (buttonLabel, buttonIcon, rssFeedUrl, buttonNewMessagesIcon, optionsDisplayText,
									optionsDisplayIcon, refreshIntervalInMinutes, uniqueComponentID) {

        var strXML = '<RSS_FEED_ITEM>';
        strXML += '<PERMISSIONS><EDIT>True</EDIT><MOVE>True</MOVE><DELETE>True</DELETE></PERMISSIONS>';
        strXML += '<USER_ATTRIBUTES><PERMISSION>FULL</PERMISSION><SHOW_IN_CHEVRON>True</SHOW_IN_CHEVRON></USER_ATTRIBUTES>';
        strXML += '<UNIQUE_COMP_ID>' + this.ToLegalXML(uniqueComponentID) + '</UNIQUE_COMP_ID>';
        strXML += '<DISPLAY_TEXT>' + this.ToLegalXML(optionsDisplayText) + '</DISPLAY_TEXT>';
        strXML += '<DISPLAY_ICON>' + this.ToLegalXML(optionsDisplayIcon) + '</DISPLAY_ICON>';
        strXML += '<TITLE>' + this.ToLegalXML(buttonLabel) + '</TITLE>';
        strXML += '<LINK>' + this.ToLegalXML(rssFeedUrl) + '</LINK>';
        strXML += '<ICON_NORMAL_URL>' + this.ToLegalXML(buttonIcon) + '</ICON_NORMAL_URL>';
        strXML += '<ICON_STARED_URL>' + this.ToLegalXML(buttonNewMessagesIcon) + '</ICON_STARED_URL>';
        strXML += '<LIVE_MODE>False</LIVE_MODE>';
        strXML += '<INTERVAL>' + this.ToLegalXML(refreshIntervalInMinutes) + '</INTERVAL>';
        strXML += '<COMMENTS_LINK/>';
        strXML += '<RSS_VIEW>ADJUSTIVE</RSS_VIEW>';
        strXML += '</RSS_FEED_ITEM>';

        return strXML;
    },

    //Returns correct XML defining toolbar RadioSation
    BuildRadioStationXml: function (name, url, contantType, mediaType, uniqueComponentID) {
        var strXML = '<RADIO_STATION>';
        strXML += '<STATION_ID>' + this.ToLegalXML(uniqueComponentID) + '</STATION_ID>';
        strXML += '<STATION_NAME>' + this.ToLegalXML(name) + '</STATION_NAME>';
        strXML += '<STATION_URL>' + this.ToLegalXML(url) + '</STATION_URL>';
        strXML += '<TYPE>' + mediaType + '</TYPE>';
        strXML += '<CONTENT_TYPE>' + contantType + '</CONTENT_TYPE>';
        strXML += '</RADIO_STATION>';

        return strXML;
    },

    BuildMenuItemLinkType: function (menuItemCaption, menuItemIconUrl, linkUrl, linkTarget) {
        var strXML = '<MENU_ITEM>';
        strXML += '<CAPTION>' + this.ToLegalXML(menuItemCaption) + '</CAPTION>';
        strXML += '<ICON_URL>' + this.ToLegalXML(menuItemIconUrl) + '</ICON_URL>';
        strXML += '<DATA><TYPE>LINK</TYPE><LINK>';
        strXML += '<URL>' + this.ToLegalXML(linkUrl) + '</URL>';
        strXML += '<TARGET>' + this.ToLegalXML(linkTarget) + '</TARGET>';
        strXML += '</LINK></DATA></MENU_ITEM>';

        return strXML;
    },

    //Menu items functions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    BuildMenuItemXML: function (menuItemCaption, menuItemIconUrl, xmlData) {
        var strXML = '<MENU_ITEM>';
        strXML += '<CAPTION>' + this.ToLegalXML(menuItemCaption) + '</CAPTION>';
        strXML += '<ICON_URL>' + this.ToLegalXML(menuItemIconUrl) + '</ICON_URL>';
        strXML += xmlData;
        strXML += '<HASH_CODE>' + MD5Hash.MD5(xmlData + menuItemCaption + menuItemIconUrl) + '</HASH_CODE>';
        strXML += '</MENU_ITEM>';
        return strXML;
    },

    BuildGadgetDataXML: function (linkUrl, width, height, defaultTarget) {
        var xmlData = '<DATA><TYPE>POP_HTML</TYPE><POP_HTML>';
        xmlData += '<URL>' + this.ToLegalXML(linkUrl) + '</URL>';
        xmlData += '<DEFAULT_TARGET>' + this.ToLegalXML(defaultTarget) + '</DEFAULT_TARGET>';
        xmlData += '<WIDTH>' + width + '</WIDTH>';
        xmlData += '<HEIGHT>' + height + '</HEIGHT>';
        xmlData += '</POP_HTML></DATA>';
        return xmlData;
    },

    BuildLinkDataXML: function (linkUrl, linkTarget) {
        var xmlData = '<DATA><TYPE>LINK</TYPE><LINK>';
        xmlData += '<URL>' + this.ToLegalXML(linkUrl) + '</URL>';
        xmlData += '<TARGET>' + this.ToLegalXML(linkTarget) + '</TARGET>';
        xmlData += '</LINK></DATA>';
        return xmlData;
    },

    BuildCommandDataXML: function (commandType) {
        var xmlData = '<DATA><TYPE>COMMAND</TYPE><COMMAND>';
        xmlData += '<TYPE>' + this.ToLegalXML(commandType) + '</TYPE>';
        xmlData += '</COMMAND></DATA>';
        return xmlData;
    },

    BuildApplicationDataXML: function (exeAlias, params, appNotFoundUrl) {
        var xmlData = '<DATA><TYPE>APPLICATION</TYPE><APPLICATION>';
        xmlData += '<EXE_ALIAS>' + this.ToLegalXML(exeAlias) + '</EXE_ALIAS>';
        xmlData += '<PARAMS>' + this.ToLegalXML(params) + '</PARAMS>';
        xmlData += '<APP_NOT_FOUND_URL>' + this.ToLegalXML(appNotFoundUrl) + '</APP_NOT_FOUND_URL>';
        xmlData += '</APPLICATION></DATA>';
        return xmlData;
    },
    //Menu items functions end ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    GetToolbarFunctionString: function (strFunctionName) {
        strFunctionName = strFunctionName.replace(/\(/, '');
        strFunctionName = strFunctionName.replace(/\)/, '');

        switch (strFunctionName) {
            case "Refresh": return "RefreshToolbarByCTID"; break;
            case "IsVisible": return "IsToolbarVisible"; break;
            case "GetInfo ": return "GetToolbarInfo"; break;
            case "AddGadget": return "AddComponentByXML"; break;
            case "AddRSS": return "AddComponentByXML"; break;
            case "AddLinkButton": return "AddComponentByXML"; break;
            default: return strFunctionName; break;
        }
    },

    parseBool: function (strValue) {
        if (!strValue) return false;

        return (strValue.toLowerCase() == "true");
    }
};

    var _ManagerHelper =
{
    CreateReturnObject: function (iErrorCode, bReturnValue, data) {
        var objReturn = new Object();
        objReturn.errorCode = iErrorCode;
        objReturn.returnValue = bReturnValue;
        objReturn.data = data;

        return objReturn;
    },

    GetManagerReturnObject: function (objManagerReturn, IsData) {
        //not an array - returned error for all responses (probably not toolbars)
        if (!objManagerReturn.length)
            return objManagerReturn;

        var objReturn = new Object();
        var iCountUnsupported = 0;

        for (var i = 0; i < objManagerReturn.length; i++) {
            if (objManagerReturn[i].returnValue) {
                if (!IsData || objManagerReturn[i].data)
                    return objManagerReturn[i];
            }

            else if (objManagerReturn[i].errorCode == 2)
                iCountUnsupported++;

            //if at least one toolbar return untrusted domain, exit with untrusted domain error code
            else if (objManagerReturn[i].errorCode == 10)
                return this.CreateReturnObject(10, false, null);

            //if at least one toolbar returned mystuff not visible, exit
            else if (objManagerReturn[i].errorCode == 11)
                return this.CreateReturnObject(11, false, null);
        }

        //all toolbars are not support this command
        if (iCountUnsupported == objManagerReturn.length)
            return this.CreateReturnObject(2, false, null);

        //at least one toolbar responded, but the value is empty
        if (IsData)
            return this.CreateReturnObject(1, true, null);
        //unknown error - just to make sure that always returns some object
        else
            return this.CreateReturnObject(0, false, null);
    }
}

    var ForceRefreshFlags =
{
    ALL: 0,
    SETTINGS: 1,
    CHAT: 2
    //RADIO: 4,
    //GROUPING: 8,
    //COMMUNITIES: 16,
    //MY_STUFF: 32
}

    // Handle update vents for supported functions and toolbar infos
    if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) { // Chrome or Safari web toolbars
        var ToolbarInfosObject = {
            'loadingStatus': STILL_LODING_TEXT
        };
        var SupportedFunctions = {
            'Toolbar': {
                'loadingStatus': STILL_LODING_TEXT
            },
            'Manager': {
                'loadingStatus': STILL_LODING_TEXT
            }

        };

        window.addEventListener('message', function (e) {
            if (e && e.data) {
                var event = {};
                try {
                    event = JSON.parse(e.data.replace('ToolbarApiViewMessage_', ''));
                }
                catch (e) {
                    console.log("Chrome TPI could not parse general postMessage message: ", e.data);
                }

                var eventData = event.data;

                switch (event.sourceAPI) {
                    case 'ToolbarApi':

                        switch (event.name) {
                            case 'updateSupportedFunctions':
                                SupportedFunctions = eventData.supportedFunctions;
                                break;
                            case 'updateToolbarInfos':
                                ToolbarInfosObject = eventData.toolbarInfos;
                                if (!window.wasTpiDocumentCompleteExecuted && window.TpiDocumentComplete) {
                                    window.wasTpiDocumentCompleteExecuted = true;
                                    window.TpiDocumentComplete();
                                }
                                break;
                        }
                        break;
                    case 'BcApi':
                        if (window.EBMessageReceived) {
                            window.EBMessageReceived(eventData.key, eventData.data);
                        }
                        else {
                            console.warn("Window doesn't have an EBMessageReceived function implemented.", eventData);
                        }
                        // Handle messages from bc api here
                        break;
                }
            }
        });
    }

    //User object to interact with toolbar / toolbars
    var TPI =
{
    Toolbar: function (strCTID) {

        this.CTID = strCTID;
        if (this.CTID) {
            this.IsLatestApi = _TPIHelper.ExecuteFunctionSingle(["IsLatestApi"], strCTID).returnValue;
            this.IsToolbarInstalled = -1;
        }

        this.Refresh = function () {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["RefreshToolbarByCTID"], this.CTID);
            else {
                var bResult = _RefreshToolbarByCTID(this.CTID);
                return _TPIHelper.GetOldApiResult(bResult);
            }
        };

        this.ForceRefresh = function () {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["ForceRefreshToolbar"], this.CTID);
            else {
                var bResult = _RefreshToolbarByCTID(this.CTID);
                return _TPIHelper.GetOldApiResult(bResult);
            }
        };

        this.ForceRefreshServices = function (flags) {
            if (!this.CTID) return this.NoCTID();
            if (typeof (flags) == "undefined") return this.ParametersError();

            if (this.IsLatestApi) {
                if (this.IsSupportedFunction("ForceRefreshServices").returnValue)
                    return _TPIHelper.ExecuteFunctionSingle(["ForceRefreshServices", flags], this.CTID);
                else
                    return this.ForceRefresh();
            }
            else {
                var bResult = _RefreshToolbarByCTID(this.CTID);
                return _TPIHelper.GetOldApiResult(bResult);
            }
        };

        this.IsVisible = function () {
            if (!this.CTID) return this.NoCTID();

            var returnObj = null;
            if (this.IsLatestApi) {
                returnObj = _TPIHelper.ExecuteFunctionSingle(["IsToolbarVisible"], this.CTID);
            }
            else {
                var bResult = _IsToolbarInstalled(this.CTID);
                returnObj = _TPIHelper.GetOldApiResult(bResult);
            }

            if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
                if (returnObj.errorCode === 1) {
                    returnObj.returnValue = (returnObj.isVisible === "true" ? true : false);
                }
            }

            return (returnObj);
        };

        this.IsInstalled = function () {
            return (_TPIHelper.ExecuteFunctionSingle(["IsInstalled"], this.CTID));
        };

        this.IsHidden = function () {
            var returnObj = this.IsInstalled();
            if (returnObj.returnValue) {
                returnObj = _TPIHelper.ExecuteFunctionSingle(["IsHidden"], this.CTID);

                if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
                    var isVisibleReturnObj = this.IsVisible();
                    if (isVisibleReturnObj.errorCode === 1 && isVisibleReturnObj.isVisible === "false") {
                        returnObj.returnValue = true;
                    }
                    else {
                        returnObj.returnValue = false;
                    }
                }
            }

            return (returnObj);
        };

        this.ShowHiddenToolbar = function () {
            var returnObj = this.IsHidden();
            if (returnObj.returnValue) {
                if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT && (!ToolbarInfosObject[this.CTID].allowShowingHiddenToolbar || ToolbarInfosObject[this.CTID].allowShowingHiddenToolbar === "false")) {
                    returnObj.errorCode = ERROR_CODE_PERMISSION_DENIED;
                    returnObj.returnValue = false;
                }
                else {
                    returnObj = _TPIHelper.ExecuteFunctionSingle(["ShowHiddenToolbar"], this.CTID);
                }
            }

            return (returnObj);
        };

        this.AddComponentByXML = function (strXML) {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddComponentByXML", strXML], this.CTID);
            else {
                var bResult = _AddComponentByXML(strXML, this.CTID)
                return _TPIHelper.GetOldApiResult(bResult);
            }
        };

        this.GetInfo = function () {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi) {
                if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
                    var toolbarInfo = ToolbarInfosObject[this.CTID];
                    var returnObj = toolbarInfo || {};
                    if (toolbarInfo !== undefined) {
                        returnObj.errorCode = 1;
                        returnObj.returnValue = true;
                    }
                    else { // Toolbar is not installed
                        returnObj.errorCode = 0;
                        returnObj.returnValue = false;
                    }

                    return returnObj;
                }
                else {
                    return _TPIHelper.ExecuteFunctionSingle(["GetToolbarInfo"], this.CTID);
                }
            }
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand()
            }
        };

        this.AddGadget = function (buttonLabel, buttonIcon, buttonTooltip, linkTargetUrl,
					   width, height, defaultTarget, optionsDisplayText, optionsDisplayIcon, uniqueComponentID) {
            if (!this.CTID) return this.NoCTID();

            //parameters checks
            if (buttonLabel == "" && buttonIcon == "" && optionsDisplayIcon == "" && optionsDisplayText == "") {
                return this.ParametersError();
            }

            if (typeof linkTargetUrl == "undefined" || linkTargetUrl == "") {
                return this.ParametersError();
            }

            if (typeof width == "undefined" || width == "" || height == "undefined" || height == "") {
                return this.ParametersError();
            }

            if (typeof optionsDisplayText == "undefined" || optionsDisplayText == "") {
                optionsDisplayText = buttonLabel;
            }

            if (typeof optionsDisplayIcon == "undefined" || optionsDisplayIcon == "") {
                optionsDisplayIcon = buttonIcon;
            }

            if (typeof uniqueComponentID == "undefined" || uniqueComponentID == "") {
                uniqueComponentID = "gadget" + linkTargetUrl + width + height;
            }

            if (typeof defaultTarget == "undefined" || defaultTarget == "") {
                defaultTarget = "_SELF";
            }

            var xmlData = "<DATA><TYPE>POP_HTML</TYPE><POP_HTML><URL>" + _TPIHelper.ToLegalXML(linkTargetUrl) + "</URL>";
            xmlData += "<DEFAULT_TARGET>" + _TPIHelper.ToLegalXML(defaultTarget) + "</DEFAULT_TARGET><WIDTH>" + width + "</WIDTH><HEIGHT>" + height + "</HEIGHT></POP_HTML></DATA>";

            var strXML = _TPIHelper.BuildButtonXml(buttonLabel, buttonIcon, buttonTooltip, xmlData,
				       optionsDisplayText, optionsDisplayIcon, uniqueComponentID);


            return this.AddComponentByXML(strXML);
        };

        this.AddRSS = function (buttonLabel, buttonIcon, rssFeedUrl, buttonNewMessagesIcon, optionsDisplayText,
									optionsDisplayIcon, refreshIntervalInMinutes, uniqueComponentID) {
            if (!this.CTID) return this.NoCTID();

            //parameters checks
            if (buttonLabel == "" && buttonIcon == "" && optionsDisplayIcon == "" && optionsDisplayText == "") {
                return this.ParametersError();
            }

            if (typeof rssFeedUrl == "undefined" || rssFeedUrl == "") {
                return this.ParametersError();
            }

            if (typeof optionsDisplayText == "undefined" || optionsDisplayText == "") {
                optionsDisplayText = buttonLabel;
            }

            if (typeof optionsDisplayIcon == "undefined" || optionsDisplayIcon == "") {
                optionsDisplayIcon = buttonIcon;
            }

            if (typeof buttonNewMessagesIcon == "undefined" || buttonNewMessagesIcon == "") {
                buttonNewMessagesIcon = buttonIcon;
            }

            if (typeof uniqueComponentID == "undefined" || uniqueComponentID == "") {
                uniqueComponentID = "rss" + rssFeedUrl;
            }

            if (typeof refreshIntervalInMinutes == "undefined" || refreshIntervalInMinutes == "") {
                refreshIntervalInMinutes = "120";
            }

            var strXML = _TPIHelper.BuildRssXml(buttonLabel, buttonIcon, rssFeedUrl, buttonNewMessagesIcon, optionsDisplayText,
								    optionsDisplayIcon, refreshIntervalInMinutes, uniqueComponentID);

            return this.AddComponentByXML(strXML);
        };

        this.AddLinkButton = function (buttonLabel, buttonIcon, buttonTooltip, linkTargetUrl,
					   linkTarget, optionsDisplayText, optionsDisplayIcon, uniqueComponentID) {
            if (!this.CTID) return this.NoCTID();

            //parameters checks
            if (buttonLabel == "" && buttonIcon == "" && optionsDisplayIcon == "" && optionsDisplayText == "") {
                return this.ParametersError();
            }

            if (typeof linkTargetUrl == "undefined" || linkTargetUrl == "") {
                return this.ParametersError();
            }

            if (typeof optionsDisplayText == "undefined" || optionsDisplayText == "") {
                optionsDisplayText = buttonLabel;
            }

            if (typeof optionsDisplayIcon == "undefined" || optionsDisplayIcon == "") {
                optionsDisplayIcon = buttonIcon;
            }

            if (typeof uniqueComponentID == "undefined" || uniqueComponentID == "") {
                uniqueComponentID = "button" + linkTargetUrl;
            }

            if (typeof linkTarget == "undefined" || linkTarget == "") {
                linkTarget = "SELF";
            }

            var xmlData = "<DATA><TYPE>LINK</TYPE><LINK><URL>" + _TPIHelper.ToLegalXML(linkTargetUrl) + "</URL><TARGET>" + _TPIHelper.ToLegalXML(linkTarget) + "</TARGET></LINK></DATA>";

            var strXML = _TPIHelper.BuildButtonXml(buttonLabel, buttonIcon, buttonTooltip, xmlData,
				       optionsDisplayText, optionsDisplayIcon, uniqueComponentID);

            return this.AddComponentByXML(strXML);
        };

        this.AddRadioStation = function (name, url, contantType, mediaType, uniqueComponentID) {
            if (!name || !url)
                return this.ParametersError();

            if (!contantType)
                contantType = "MP";

            if (!mediaType)
                mediaType = "STREAM";

            if (!uniqueComponentID)
                uniqueComponentID = url;

            var strXML = _TPIHelper.BuildRadioStationXml(name, url, contantType, mediaType, uniqueComponentID);

            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddRadioStation", strXML], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.SwitchToCommunity = function (strCTID) {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["SwitchToCommunity", strCTID], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.GetSupportedUserAddMenu = function () {
            if (!this.CTID) return this.NoCTID();

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["GetSupportedUserAddMenu"], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.AddLinkMenuItem = function (uniqueComponentID, menuItemCaption, menuItemIconUrl, linkUrl, linkTarget) {
            if (!this.CTID) return this.NoCTID();

            if (!uniqueComponentID || !linkUrl || (!menuItemCaption && !menuItemIconUrl))
                return this.ParametersError();

            var strXMLData = _TPIHelper.BuildLinkDataXML(linkUrl, linkTarget);
            var strXML = _TPIHelper.BuildMenuItemXML(menuItemCaption, menuItemIconUrl, strXMLData);

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddUserLinkMenuItem", strXML, uniqueComponentID], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.AddGadgetMenuItem = function (uniqueComponentID, menuItemCaption, menuItemIconUrl, linkUrl, width, height, defaultTarget) {
            if (!this.CTID) return this.NoCTID();

            if (!uniqueComponentID || !linkUrl || (!menuItemCaption && !menuItemIconUrl) || !width || !height)
                return this.ParametersError();

            var strXMLData = _TPIHelper.BuildGadgetDataXML(linkUrl, width, height, defaultTarget);
            var strXML = _TPIHelper.BuildMenuItemXML(menuItemCaption, menuItemIconUrl, strXMLData);

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddUserLinkMenuItem", strXML, uniqueComponentID], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.AddCommandMenuItem = function (uniqueComponentID, menuItemCaption, menuItemIconUrl, commandType) {
            if (!this.CTID) return this.NoCTID();

            if (!uniqueComponentID || (!menuItemCaption && !menuItemIconUrl) || !commandType)
                return this.ParametersError();

            var strXMLData = _TPIHelper.BuildCommandDataXML(commandType);
            var strXML = _TPIHelper.BuildMenuItemXML(menuItemCaption, menuItemIconUrl, strXMLData);

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddUserLinkMenuItem", strXML, uniqueComponentID], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.AddApplicationMenuItem = function (uniqueComponentID, menuItemCaption, menuItemIconUrl, exeAlias, params, appNotFoundUrl) {
            if (!this.CTID) return this.NoCTID();

            if (!uniqueComponentID || (!menuItemCaption && !menuItemIconUrl) || !exeAlias)
                return this.ParametersError();

            var strXMLData = _TPIHelper.BuildApplicationDataXML(exeAlias, params, appNotFoundUrl)
            var strXML = _TPIHelper.BuildMenuItemXML(menuItemCaption, menuItemIconUrl, strXMLData);

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddUserLinkMenuItem", strXML, uniqueComponentID], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        /* *********************** MyStuff functions *********************** */
        var self = this;
        function addApp(appGuid, appName, sourceId) {
            if (!window.mAddAppsArrayList) {
                window.mAddAppsArrayList = new Object();
            }
            if (!window.mAddAppsArrayList[self.CTID]) {
                window.mAddAppsArrayList[self.CTID] = new Array();
            }

            window.mAddAppsArrayList[self.CTID].push({ guid: appGuid, name: appGuid });
            var mAddAppsSource = sourceId;

            clearTimeout(window["mAddAppsTimerId_" + self.CTID]);


            window["mAddAppsTimerId_" + self.CTID] = setTimeout(function () {
                self.AddApps({
                    source: mAddAppsSource,
                    apps: window.mAddAppsArrayList[self.CTID]
                });

                delete window.mAddAppsArrayList[self.CTID];
                delete window["mAddAppsTimerId_" + self.CTID];
            }, 100);

            return self.OKResponse();
        };

        this.AddMyStuffComponent = function (componentGuid, compInstanceGuid, compName, sourceId) {
            if (!this.CTID) return this.NoCTID();
            if (!componentGuid) return this.ParametersError();
            if (typeof compName == "undefined") compName = "";

            if (this.IsLatestApi) {
                var toolbarInfo = this.GetInfo();
                if (toolbarInfo && toolbarInfo.isNewAddMystuffComponent) {
                    if (this.IsSupportedFunction("AddApps").returnValue && this.IsTrustedDomain().returnValue) {
                        return addApp(componentGuid, compName, sourceId);
                    } else {
                        return _TPIHelper.ExecuteFunctionSingle(["AddMyStuffComponent", componentGuid, compName, sourceId], this.CTID);
                    }
                }
                else
                    return _TPIHelper.ExecuteFunctionSingle(["AddMyStuffComponent", componentGuid, compInstanceGuid, compName], this.CTID);
            }
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.AddApps = function (data) {
            if (!this.CTID) return this.NoCTID();
            var strData = "";
            try {
                strData = EBJSON.stringify(data);
            }
            catch (e) {
                return this.ParametersError();
            }

            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["AddApps", strData], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        this.IsTrustedDomain = function () {
            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["IsTrustedDomain"], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        //************************ MyStuff functions end ************************

        this.IsSupportedFunction = function (strFunctionName) {
            if (!this.CTID) return this.NoCTID();
            if (this.IsLatestApi) {
                var strToolbarFunctionName = _TPIHelper.GetToolbarFunctionString(strFunctionName);

                if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
                    return {
                        'returnValue': (strToolbarFunctionName in SupportedFunctions.Toolbar),
                        'errorCode': 1
                    };
                }
                else {
                    return _TPIHelper.ExecuteFunctionSingle([_TPIHelper.IsSupportedFunction, strToolbarFunctionName], this.CTID);
                }

            }
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

        //builds xml for response parser, for unsupported command
        this.UnsupportedCommand = function () {
            var strXmlResult = "<RETURN_OBJECT><RETURN_VALUE>false</RETURN_VALUE><ERROR_CODE>2</ERROR_CODE></RETURN_OBJECT>";
            return _TPIHelper.GetResult(strXmlResult);
        };

        //builds xml for response parser, for input parameters error
        this.ParametersError = function () {
            var strXmlResult = "<RETURN_OBJECT><RETURN_VALUE>false</RETURN_VALUE><ERROR_CODE>3</ERROR_CODE></RETURN_OBJECT>";
            return _TPIHelper.GetResult(strXmlResult);
        };

        this.NoToolbarInstalled = function () {
            var strXmlResult = "<RETURN_OBJECT><RETURN_VALUE>false</RETURN_VALUE><ERROR_CODE>0</ERROR_CODE></RETURN_OBJECT>";
            return _TPIHelper.GetResult(strXmlResult);
        };

        this.NoCTID = function () {
            var strXmlResult = "<RETURN_OBJECT><RETURN_VALUE>false</RETURN_VALUE><ERROR_CODE>6</ERROR_CODE></RETURN_OBJECT>";
            return _TPIHelper.GetResult(strXmlResult);
        };

        this.OKResponse = function () {
            var strXmlResult = "<RETURN_OBJECT><RETURN_VALUE>true</RETURN_VALUE><ERROR_CODE>1</ERROR_CODE></RETURN_OBJECT>";
            return _TPIHelper.GetResult(strXmlResult);
        };

        this.GetIsToolbarInstalled = function () {
            if (this.IsToolbarInstalled == -1) {
                this.IsToolbarInstalled = _IsToolbarInstalled(this.CTID);
            }

            return this.IsToolbarInstalled;
        };

        this.IsAppInstalled = function (guid) {
            if (this.IsLatestApi)
                return _TPIHelper.ExecuteFunctionSingle(["IsAppInstalled", guid], this.CTID);
            else {
                if (!this.GetIsToolbarInstalled())
                    return this.NoToolbarInstalled();
                else
                    return this.UnsupportedCommand();
            }
        };

    },

    //Helper manager to interract with multiple toolbars
    Manager: function () {

        this.GetAllToolbarsInfo = function () {

            if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
                var ToolbarInfos = null;

                if (ToolbarInfosObject && ToolbarInfosObject['loadingStatus'] != STILL_LODING_TEXT) {
                    ToolbarInfos = [];

                    for (var ctid in ToolbarInfosObject) {
                        ToolbarInfos.push(ToolbarInfosObject[ctid]);
                        var toolbarInfo = ToolbarInfos[ToolbarInfos.length - 1];
                        toolbarInfo.errorCode = 1;
                        toolbarInfo.returnValue = true;
                    }
                }
                return ToolbarInfos;
            }
            else {
                return _TPIHelper.ExecuteFunctionMultiple(["GetAllToolbarsInfo"]);
            }
        };

        this.AddAlert = function (alertId) {
            return _TPIHelper.ExecuteFunctionAny(["AddAlert", alertId]);
        };

        this.AddMyStuffAlert = function (alertId, alertProviderName) {
            return _TPIHelper.ExecuteFunctionAny(["AddMyStuffAlert", alertId, alertProviderName]);
        };

        this.IsSubscribedToAlert = function (alertId) {
            var objMultipleReturn = _TPIHelper.ExecuteFunctionAny(["IsSubscribedToAlert", alertId]);
            return _ManagerHelper.GetManagerReturnObject(objMultipleReturn, false);
        };

        this.IsSupportedFunction = function (strFunctionName) {
            var strToolbarFunctionName = _TPIHelper.GetToolbarFunctionString(strFunctionName);

            if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {

                return {
                    'returnValue': (strToolbarFunctionName in SupportedFunctions.Manager) || (strToolbarFunctionName in SupportedFunctions.Toolbar),
                    'errorCode': 1
                };
            }
            else {
                var objMultipleReturn = _TPIHelper.ExecuteFunctionAny([_TPIHelper.IsSupportedFunction, strToolbarFunctionName]);

                if (!objMultipleReturn.length)
                    return objMultipleReturn;

                var bIsSucceeded = false;

                for (var i = 0; i < objMultipleReturn.length; i++) {
                    //at least one toolbar support this function
                    if (objMultipleReturn[i].returnValue)
                        return objMultipleReturn[i];

                    //at least one toolbar supports the check-supported function, but not supports the requested function
                    if (objMultipleReturn[i].errorCode == 1)
                        bIsSucceeded = true;
                }

                //at least one toolbar supports the check-supported function, but not supports the requested function
                if (bIsSucceeded)
                    return _ManagerHelper.CreateReturnObject(1, false, null);
                //all toolbars doesn't recognize the heck-supported function
                else
                    return _ManagerHelper.CreateReturnObject(2, false, null);
            }
        };

        this.SendMessage = function (key, data) {
            if (_TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) { // Chrome or Safari web toolbars
                var sendMessageEvent = {
                    'name': 'sendMessage',
                    'data': {
                        'key': key,
                        'data': data
                    },
                    'sourceAPI': 'ToolbarApi',
                    'targetAPI': 'BcApi'
                };

                // post message to injected script (same domain)
                window.postMessage(JSON.stringify(sendMessageEvent), '*'); //document.location.origin);
            }
            else {
                //send to toolbar
                var oToolbar = null;
                for (var i = 0; i < _RegistredToolbars.arrToolbars.length; i++) {
                    oToolbar = _RegistredToolbars.arrToolbars[i];
                    oToolbar.ExecuteApiFunction(["SendMessage", key, data]);
                }
            }
        };

        this.RegisterForMessaging = function (topic, callback) {
            if (!_RegistredToolbars.registeredTopicHash[topic])
                _RegistredToolbars.registeredTopicHash[topic] = new Array();
            _RegistredToolbars.registeredTopicHash[topic].push(callback);
        };

        this.IsAppInstalled = function (strGuid) {
            var arrToolbars = this.GetAllToolbarsInfo();
            var oToolbar = null;
            if (!arrToolbars.length) {//{returnValue: false, errorCode: 0}
                oToolbar = new TPI.Toolbar("");
                return oToolbar.NoToolbarInstalled();
            }

            var oRes = null;
            for (var i = 0; i < arrToolbars.length; i++) {
                oToolbar = new TPI.Toolbar(arrToolbars[i].CTID);
                try {
                    oRes = oToolbar.IsAppInstalled(strGuid);
                    if (oRes.returnValue)
                        return oRes;
                } catch (e) { }
            }

            if (!oRes) {//{returnValue: false, errorCode: 0}
                oToolbar = new TPI.Toolbar("");
                return oToolbar.NoToolbarInstalled();
            }
            return oRes;
        };
    }
}

    // ======================= Older API Functions ========================

    //this is a blank object
    //this object is used to catch all the calls 
    //that the toolbars(IE & Firefox) didn't catch
    var EBToolbarApi =
{
    Result: false,

    ResetResult: function () {
        this.SetResult(false);
    },

    SetResult: function (bValue) {
        this.Result = bValue;
    },

    GetResult: function () {
        return this.Result;
    },

    RefreshAllToolbars: function () {
        //do nothing...
    },

    RefreshToolbarByCTID: function (strCTID) {
        //do nothing...	
    },

    IsToolbarInstalled: function (strCTID) {
        //do nothing...
    },

    AddComponentByXML: function (strXML, strCTID) {
        //do nothing...
    }
}

    //wrapped function to set result (for IE)
    function EBSetResult(bValue) {
        EBToolbarApi.SetResult(bValue);
    }

    //-------------------------------------------------------------------

    /***** Public API Functions *****/

    /******************************** - IMPORTTANT - **********************************/
    //                                                                                //
    //	The functions should be called the earliset at the onload event of the page   //
    //                                                                                //
    /**********************************************************************************/

    /************************************************/
    /*			bool RefreshAllToolbars()			*/
    /*	This function refreshes all toolbars.		*/
    /************************************************/
    function RefreshAllToolbars() {
        var bResult = _RefreshAllToolbars();

        var oManager = new TPI.Manager();
        var oResult = oManager.GetAllToolbarsInfo();
        var bResult = true;
        if (oResult.length) {
            for (var i = 0; i < oResult.length; i++) {
                var oToolbar = new TPI.Toolbar(oResult[i].CTID);
                var oRes = oToolbar.Refresh();
                bResult = oRes.returnValue || bResult;
            }
        }

        return bResult;
    }

    /************************************************/
    /*		bool RefreshToolbarByCTID(strCTID)		*/
    /*	This function refreshes the toolbar by CTID.*/
    /************************************************/
    function RefreshToolbarByCTID(strCTID) {
        var oToolbar = new TPI.Toolbar(strCTID);
        var oRes = oToolbar.Refresh();
        return oRes.returnValue;
    }

    /************************************************/
    /*		bool IsToolbarInstalled(strCTID)	    */
    /*	This function returns true if the toolbar   */
    /*	with the given CTID is installed.			*/
    /************************************************/
    function IsToolbarInstalled(strCTID) {
        var oToolbar = new TPI.Toolbar(strCTID);
        var oRes = oToolbar.IsVisible();
        return oRes.returnValue;
    }

    /************************************************/
    /*		bool AddComponentByXML(strXML,strCTID)  */
    /*	This function returns true if the toolbar   */
    /*	with the given CTID is installed.			*/
    /************************************************/
    function AddComponentByXML(strXML, strCTID) {
        var oToolbar = new TPI.Toolbar(strCTID);
        var oRes = oToolbar.AddComponentByXML(strXML);
        return oRes.returnValue;
    }


    //Inner functions for new API to talk to old toolbars
    function __ExecuteOldApiFunction(strUrl) {
        var strBrowser = _TPIHelper.GetBrowser();
        switch (strBrowser) {
            case BROWSERS_DEF.IE6:
                location.href = "javascript:" + strUrl;
                break;
            case BROWSERS_DEF.IE7:
                _TPIHelper.NavigateInIFrame("about:blank#javascript:" + strUrl);
                break;
            case BROWSERS_DEF.FF:
                eval(strUrl);
                break;
        }
    };

    function _RefreshAllToolbars() {
        EBToolbarApi.ResetResult();

        __ExecuteOldApiFunction("EBToolbarApi.RefreshAllToolbars();");
        return EBToolbarApi.GetResult();
    }

    function _RefreshToolbarByCTID(strCTID) {
        EBToolbarApi.ResetResult();

        __ExecuteOldApiFunction("EBToolbarApi.RefreshToolbarByCTID('" + strCTID + "');");
        return EBToolbarApi.GetResult();
    }

    function _IsToolbarInstalled(strCTID) {
        EBToolbarApi.ResetResult();

        __ExecuteOldApiFunction("EBToolbarApi.IsToolbarInstalled('" + strCTID + "');");
        return EBToolbarApi.GetResult();
    }

    function _AddComponentByXML(strXML, strCTID) {
        EBToolbarApi.ResetResult();

        __ExecuteOldApiFunction("EBToolbarApi.AddComponentByXML(\"" + strXML + "\",\"CTID=" + strCTID.toUpperCase() + "\");");
        return EBToolbarApi.GetResult();
    }


    function __EBonMessageReceived(ctid, topic, data) {
        if (!_RegistredToolbars.registeredTopicHash[topic]) return;

        for (var i = 0; i < _RegistredToolbars.registeredTopicHash[topic].length; i++)
            _RegistredToolbars.registeredTopicHash[topic][i](topic, data);
    };


    /*
    * A JavaScript implementation of the RSA Data Security, Inc. this.MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Copyright (C) Paul Johnston 1999 - 2000.
    * Updated by Greg Holt 2000 - 2001.
    * See http://pajhome.org.uk/site/legal.html for details.
    */

    /*
    * Convert a 32-bit number to a hex string with ls-byte first
    */
    var MD5Hash =
{
    hex_chr: "0123456789abcdef",

    rhex: function (num) {
        str = "";
        for (j = 0; j <= 3; j++)
            str += this.hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
               this.hex_chr.charAt((num >> (j * 8)) & 0x0F);
        return str;
    },

    /*
    * Convert a string to a sequence of 16-word blocks, stored as an array.
    * Append pthis.adding bits and the length, as described in the this.MD5 standard.
    */
    str2blks_MD5: function (str) {
        nblk = ((str.length + 8) >> 6) + 1;
        blks = new Array(nblk * 16);
        for (i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    },

    /*
    * this.add integers, wrapping at 2^32. This uses 16-bit operations internally 
    * to work around bugs in some JS interpreters.
    */
    add: function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    },

    /*
    * Bitwise rotate a 32-bit number to the left
    */
    rol: function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    },

    /*
    * These functions implement the basic operation for each round of the
    * algorithm.
    */
    cmn: function (q, a, b, x, s, t) {
        return this.add(this.rol(this.add(this.add(a, q), this.add(x, t)), s), b);
    },

    ff: function (a, b, c, d, x, s, t) {
        return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
    },

    gg: function (a, b, c, d, x, s, t) {
        return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
    },

    hh: function (a, b, c, d, x, s, t) {
        return this.cmn(b ^ c ^ d, a, b, x, s, t);
    },

    ii: function (a, b, c, d, x, s, t) {
        return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
    },

    /*
    * Take a string and return the hex representation of its this.MD5.
    */
    MD5: function (str) {
        x = this.str2blks_MD5(str);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = this.ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = this.ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = this.ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = this.ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = this.ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = this.ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = this.ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = this.ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = this.ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = this.ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = this.ff(c, d, a, b, x[i + 10], 17, -42063);
            b = this.ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = this.ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = this.ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = this.ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = this.ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = this.gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = this.gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = this.gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = this.gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = this.gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = this.gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = this.gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = this.gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = this.gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = this.gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = this.gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = this.gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = this.gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = this.gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = this.gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = this.gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = this.hh(a, b, c, d, x[i + 5], 4, -378558);
            d = this.hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = this.hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = this.hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = this.hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = this.hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = this.hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = this.hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = this.hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = this.hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = this.hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = this.hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = this.hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = this.hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = this.hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = this.hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = this.ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = this.ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = this.ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = this.ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = this.ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = this.ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = this.ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = this.ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = this.ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = this.ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = this.ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = this.ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = this.ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = this.ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = this.ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = this.ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = this.add(a, olda);
            b = this.add(b, oldb);
            c = this.add(c, oldc);
            d = this.add(d, oldd);
        }
        return this.rhex(a) + this.rhex(b) + this.rhex(c) + this.rhex(d);
    }
};

    // Resend Tpi.View Messages all over again if TPI.View was created before regular TPI
    if (_TPIHelper && _TPIHelper.GetBrowser() === BROWSERS_DEF.WEBKIT) {
        var elementIsTpiViewExists = document.getElementById("__isTpiViewExists");
        if (elementIsTpiViewExists) {
            var sendMessageEvent = {
                'name': 'ResendTpiViewMessages',
                'data': {},
                'sourceAPI': 'ToolbarApi',
                'targetAPI': 'ToolbarApi'
            };
            // post message to injected script (same domain)
            if (document && document.location && document.location.href.toUpperCase().indexOf("FACEBOOK.COM") === -1) {
                window.postMessage(JSON.stringify(sendMessageEvent), document.location.origin);
            }
        }
    }
}