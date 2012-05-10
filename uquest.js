var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));
//var is_ie = navigator.userAgent.match(/MSIE/);
//var is_firefox = navigator.userAgent.match(/firefox/i);

var QuestSettings = Backbone.Model.extend({
    defaults: function() {
        return {
            Active: true
        };
    },
    switch_state: function() {
        this.set('Active', !this.get('Active'));
    },
    localStorage: new Store('QuestSettings')
});

var QuestView = Backbone.View.extend({
    el: '#uquest_button',
    injection_initialized: false,
    _links_count: 0,

    //uquest.inject.js
    _script_init:  "window.QuestModule = (function () {\n    //private properties\n    var _$ = null;\n    var _is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));\n    var _is_ie = navigator.userAgent.match(/MSIE/);\n    var _css_url = null;\n    var _css_ie_fix_url = null;\n    var _img_icon_path = null;\n    var _is_active = false;\n    var _selector_new_link = 'a:not([data-uquest-processed])';\n    var _css_uquest_link = 'utorrent-uquest-link';\n    var _css_active_link_class = 'utorrent-uquest-active';\n    var _css_uquest = 'uquest';\n\n    //private methods\n    //public methods handlers section\n    function _initialize(){\n        var css_inject_path = window.QuestModuleInitSettings.css_inject_path;\n        var css_version = window.QuestModuleInitSettings.css_version;\n        _css_url = ''.concat(css_inject_path, 'style_inject.css?v=', css_version);\n        _css_ie_fix_url = ''.concat(css_inject_path, 'style_inject_iefix.css?v=', css_version);\n        _img_icon_path = ''.concat(css_inject_path, 'images/toolbar/dl_icon.png');\n        _is_active = window.QuestModuleInitSettings.is_active;\n\n        _init_jQuery(function(){\n            _init_css();\n            _init_links();\n            _init_event_handlers();\n            _toolbar_callback('injection_initialized:0');\n        });\n    }\n\n    function _set_state(active) {\n        _is_active = active;\n        if(_is_active){\n            _$('.' + _css_uquest_link).each(function(index, item){\n                _show_active_link(item);\n            })\n        } else {\n            _$('.' + _css_uquest_link).each(function(index, item){\n                _$(item).removeClass(_css_active_link_class).children('.' + _css_uquest).remove();\n            })\n        }\n    }\n\n    //init section\n    function _init_jQuery(jQuery_initialized_callback) {\n        if (_get_jQuery_version() < 151) { //Conduit uses jQuery ver 1.5.1 in Chrome\n            var head = document.getElementsByTagName('head')[0];\n            var script = document.createElement('script');\n            script.type = 'text/javascript';\n\n            function script_loaded_callback(){\n                script.onload = script.onreadystatechange = null;\n                _$ = jQuery.noConflict(true);\n                jQuery_initialized_callback();\n            }\n\n            if(script.onreadystatechange !== undefined){//ie fix\n                script.timer = setInterval( function(){\n                        if (script.readyState == 'loaded' || script.readyState == 'complete'){\n                            clearInterval(script.timer);\n                            script_loaded_callback();\n                        }\n                    }, 100\n                );\n            } else { //all other browsers\n                script.onload = script_loaded_callback;\n            }\n\n            script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';\n            head.appendChild(script);\n        } else {\n            _$ = window.jQuery;\n            jQuery_initialized_callback();\n        }\n    }\n\n    function _init_css() {\n        function load_css (css_url) {\n            if(_$('head link[href=\"' + css_url + '\"]').length == 0) {\n                _$('<link>').attr('type', 'text/css').attr('rel', 'stylesheet')\n                    .attr('href', css_url)\n                    .appendTo('head');\n            }\n        }\n        load_css(_css_url);\n        if(_is_ie) {\n            load_css(_css_ie_fix_url);\n        }\n    }\n\n    function _init_links() {\n        _$(_selector_new_link).each(function(index, item){\n            var url_parts = item.href.split('?');\n            //is direct link?\n            if(url_parts[0].match(/[\.]torrent$|^magnet\:/i)) {\n//                        console.log(''.concat('direct torrent link ', item.href, ' ', _$(item).text()));\n                _$(item).addClass(_css_uquest_link);\n                if(_is_active) _show_active_link(item);\n            //does contain torrent or download text, not exe and from the same origin?\n            } else if (_$(item).text().match(/torrent|download/i) &&\n                !url_parts[0].match(/[\.]exe$|[\.]pdf$/i) &&\n                _is_same_origin(item)) {\n//                        console.log(''.concat('before ajax ', item.href, ' ', _$(item).text()));\n                _$.ajax({\n                    type : 'HEAD',\n                    url: item.href,\n                    dataType: 'json',\n                    async: true,\n                    complete: function(resp){\n//                                debugger;\n//                                if(resp.status == 302) {\n//                                    console.log(''.concat('url= ', item.href, ' data.redirect = ', resp.getResponseHeader('Location')));\n//                                }\n\n//                                console.log(''.concat('ResponseHeader: ', resp.getAllResponseHeaders(), ' url= ', item.href));\n                        if(resp.getResponseHeader('Content-Type') == 'application/x-bittorrent') {\n                            _$(item).addClass(_css_uquest_link);\n                            if(_is_active) _show_active_link(item);\n                        }\n                    },\n                    error : function(jqXHR, textStatus, errorThrown) {\n//                                console.log(''.concat('Error: url= ', item.href, ' textStatus = ', textStatus, 'jqXHR = ', JSON.stringify(jqXHR)));\n                        //TODO check content-type using conduit api\n                    }\n                });\n            }\n\n            _$(item).attr('data-uquest-processed', '');\n        });\n    }\n\n    function _init_event_handlers() {\n        //for jQuery 1.7+ use 'on'\n        //for jQuery 1.4.3+ use 'delegate'\n        var ver = _get_jQuery_version(_$);\n        if(ver >= 170){\n            _$(document).on('click', '.' + _css_active_link_class, this, _on_click);\n            _$(document).on('hover', '.' + _css_uquest, this, _on_mouse_hover);\n            //_$(document).on('DOMSubtreeModified', 'body', this, init_links);\n        } else if (ver >= 143) {\n            _$(document).delegate('.' + _css_active_link_class, 'click', this, _on_click);\n            _$(document).delegate('.' + _css_uquest, 'hover', this, _on_mouse_hover);\n            //_$('body').bind('DOMSubtreeModified', init_links);\n        } else {\n            debugger;\n            assert(false);\n            return;\n        }\n    }\n\n    //event handlers section\n    function _on_click(e) {\n        _toolbar_callback('url_msg:' + this.href);\n        e.preventDefault();\n    }\n\n    function _on_mouse_hover(e) {\n        if( e.type === 'mouseenter' ) {\n            _$(this).find('.tip_content').show(10);\n        } else {\n            _$(this).find('.tip_content').hide(10);\n        }\n    }\n\n    //utils section\n    function _show_active_link(item) {\n        var tip_text = item.title;\n        if(tip_text.length == 0){\n            if(_is_ie) {\n                tip_text = item.innerText;\n//            } else if (_is_chrome) {\n//                tip_text = item.text.replace(/[^a-zA-Z0-9]+/g, ' ');\n            } else {\n                tip_text = item.text;\n            }\n        }\n        tip_text = '<b>Download</b>&nbsp' + tip_text.replace(/^download|^get/i, '');\n/*\n        var uquest = ''.concat(\n            '<div class=\"uquest\"><div class=\"uquest_highlight\"><div class=\"uquest_red\"><div class=\"uquest_tip\"><img align=\"top\" src=\"',\n            _img_icon_path,\n            '\"><div class=\"tip_content\">',\n            tip_text,\n            '</div></div></div></div><div class=\"uquest_pointer_red\"></div></div>');\n*/\n        var uquest = _$('<div>').addClass(_css_uquest)\n            .append(_$('<div>').addClass('uquest_highlight')\n                .append(_$('<div>').addClass('uquest_red')\n                    .append(_$('<div>').addClass('uquest_tip')\n                        .append(_$('<img>').addClass('dl_image').attr('align', 'top').attr('src', _img_icon_path))\n                        .append(_$('<div>').addClass('tip_content').html(tip_text)))))\n            .append(_$('<div>').addClass('uquest_pointer_red'));\n\n        _$(item).append(uquest).addClass(_css_active_link_class);\n    }\n\n    function _get_jQuery_version(jQueryObj) {\n        var version;\n        if (typeof jQuery == 'undefined' && jQueryObj == undefined){\n            return -1;\n        } else if(jQueryObj){\n            version = jQueryObj.fn.jquery.split('.');\n        } else {\n            version = window.jQuery.fn.jquery.split('.');\n        }\n        return (parseInt(version[0])*100) + (parseInt(version[1])*10) + parseInt(version[2]);\n    }\n\n    function _is_same_origin (url) {\n        var loc = window.location,\n            a = document.createElement('a');\n\n        a.href = url;\n\n        return a.hostname == loc.hostname &&\n//                a.port == loc.port &&\n            a.protocol == loc.protocol;\n    }\n\n    function _toolbar_callback(msg) {\n        //TODO Remove this workaround after conduit fix chrome\n        if(_is_chrome) {\n            try {\n                var sendMessageEvent = {'name': 'sendMessage','data': {key:msg},'sourceAPI': 'ToolbarApi','targetAPI': 'BcApi'};\n                if (document && document.location && document.location.href.toUpperCase().indexOf('FACEBOOK.COM') === -1) {\n                    window.postMessage(JSON.stringify(sendMessageEvent), '*');\n                }\n            } catch(e) {\n                console.error('BCAPI ERROR: ', e, e.stack);\n            }\n        } else {\n            EBCallBackMessageReceived(msg);\n        }\n    }\n\n    return {\n        //public section\n        initialize : _initialize,\n        set_state : _set_state\n    };\n}());\n\nwindow.QuestModule.initialize();\n",
    //uquest.inject.setactive.js
    _script_set_active:  "(function () {\n    window.QuestModule.set_state(true);\n}());",
    //uquest.inject.setinactive.js
    _script_set_inactive:  "(function () {\n    window.QuestModule.set_state(false);\n}());",

    initialize: function(){
        this.model.fetch();
        this.update_toolbar_button(this._links_count);
        var script_init_settings = ''.concat('var QuestModuleInitSettings = { ',
            'css_inject_path : \'', config.css_inject_path, '\', ',
            'css_version : \'', config.cache_bust_version, '\', ',
            'is_active : ', this._is_active(), '};\n');
        this._script_init = script_init_settings + this._script_init;
    },
    events: {
        "click": "_on_click"
    },
    init_injection: function() {
        this._inject_script(this._script_init);
        //TODO resolve injection on new incative tab with Conduit. Hint EBTabChange
        //        this.injection_initialized = true;
    },

    _inject_script: function(script){
        JSInjection(script);
    },
    _is_active: function() {
        return this.model.get('Active');
    },
    _on_click: function(){
        if(!this.injection_initialized){
            this.init_injection();
            return;
        }

        this.model.fetch();
        this.model.switch_state();
        this.model.save();
        this.update_toolbar_button(this._links_count);
        this._update_page();
    },
    update_toolbar_button: function(links_number) {
        this._links_count = links_number;
        if(!this.injection_initialized) {
            this.$el.addClass('inactive').attr('title', 'Initializing...');
        } else if (this._is_active()){
            var str_links_number = this._links_count > 0 ? this._links_count : '';
            this.$el.removeClass('inactive').attr('title', 'Turn Off uQuest').children('.links_number').text(str_links_number);
        } else {
            this.$el.addClass('inactive').attr('title', 'Turn On uQuest');
        }
    },
    _update_page: function() {
        if(!this.injection_initialized) {
            return;
        } else if (this._is_active()){
            this._inject_script(this._script_set_active);
        } else {
            this._inject_script(this._script_set_inactive);
        }
    }
});

jQuery(document).ready(function () {
    window.app = new App( { type: 'uquest' } );

    // doesnt work correctly in chrome (cant set window attributes)
    if (is_chrome) {
        // call EBDocumentComplete manually for chrome...
        EBDocumentComplete();
    }
});

function EBDocumentComplete() {
    if(!window.QuestButtonView) {
        window.QuestButtonView = new QuestView( {model: new QuestSettings({ id: 1 })});
    } else {
        //IE and FF fix
        window.QuestButtonView.injection_initialized = false;
    }

    window.QuestButtonView.init_injection();
}

// Note
// Chrome: Conduit calls EBCallBackMessageReceived in all components
// IE and FF: Conduit calls EBCallBackMessageReceived in JSInjection trigger component only
function EBCallBackMessageReceived(msg, data) {
    var msg_parts = msg.split(':');
    var cmd = msg_parts[0];

    switch(cmd){
        case 'injection_initialized' : {
            var links_number = parseInt(msg.replace('injection_initialized:', ''));
            window.QuestButtonView.injection_initialized = true;
            window.QuestButtonView.update_toolbar_button(links_number);
            break;
        }
        case 'url_msg': {
            var url = msg.replace('url_msg:', '');
            window.app.send_message( { recipient: 'client', command: 'one_click_url', url: url } );
            break;
        }
    }
}

/*
function EBTabChange(tabid) {
    window.QuestButtonView.init_injection();
}
*/