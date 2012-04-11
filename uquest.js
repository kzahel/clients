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
    jquery_initialized: false,
    injection_initialized: false,

    //uquest.init_jquery.js
    _script_init_jquery:  "(function() {\n    if (typeof jQuery == 'undefined') {\n        var head = document.getElementsByTagName('head')[0];\n        var script = document.createElement('script');\n        script.type = 'text/javascript';\n\n        function callback(){\n            script.onload = script.onreadystatechange = null;\n            EBCallBackMessageReceived('jquery_initialized');\n        };\n\n        if(script.onreadystatechange !== undefined){//ie fix\n            script.timer = setInterval( function(){\n                    if (script.readyState == 'loaded' || script.readyState == 'complete'){\n                        clearInterval(script.timer);\n                        callback();\n                    }\n                }, 100\n            );\n        } else { //all other browsers\n            script.onload = callback;\n        }\n\n        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';\n        head.appendChild(script);\n    } else {\n        EBCallBackMessageReceived('jquery_initialized');\n    }\n}());",
    //uquest.inject.js
    _script_init:  "(function ($) {\n    var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));\n\n    window.QuestModule = {\n        _is_active : false,\n        _selector_new_link : 'a:not([data-uquest-processed])',\n//        _selector_direct_link : 'a[href$=\".torrent\"],a[href^=\"magnet:?xt=urn:btih\"]',\n        _css_uquest_link : 'utorrent-uquest-link',\n        _css_active_link_class : 'utorrent-uquest-active',\n        _css_span_class : 'utorrent-uquest-span',\n\n        initialize : function() {\n            //console.log('window.QuestModule initialize');\n            var _this = this;\n\n            //TODO url path from config\n//            var css_url = 'http://localhost/toolbar2/css/style_inject.css';\n            var css_url = '%css_inject_url%';\n\n            if($('head link[href=\"' + css_url + '\"]').length == 0) {\n                $('<link>').attr('type', 'text/css').attr('rel', 'stylesheet')\n                    .attr('href', css_url)\n                    .appendTo('head');\n            }\n\n            function init_links() {\n                $(_this._selector_new_link).each(function(index, item){\n                    var url_parts = item.href.split('?');\n                    //is direct link?\n                    if(url_parts[0].match(/\.torrent$|^magnet\:/i)) {\n//                        console.log(''.concat('direct torrent link ', item.href, ' ', $(item).text()));\n                        $(item).addClass(_this._css_uquest_link);\n                        if(_this._is_active) _this._show_active_link(_this, item);\n                    //is contain torrent or download text, not exe and from the same origin?\n                    } else if ($(item).text().match(/torrent|download/i) &&\n                               !url_parts[0].match(/\.exe$|\.pdf$/i) &&\n                               _this._is_same_origin(item)) {\n//                        console.log(''.concat('before ajax ', item.href, ' ', $(item).text()));\n                        $.ajax({\n                            type : 'HEAD',\n                            url: item.href,\n                            dataType: 'json',\n                            async: true,\n                            complete: function(resp){\n//                                debugger;\n//                                if(resp.status == 302) {\n//                                    console.log(''.concat('url= ', item.href, ' data.redirect = ', resp.getResponseHeader('Location')));\n//                                }\n\n//                                console.log(''.concat('ResponseHeader: ', resp.getAllResponseHeaders(), ' url= ', item.href));\n                                if(resp.getResponseHeader('Content-Type') == 'application/x-bittorrent') {\n                                    $(item).addClass(_this._css_uquest_link);\n                                    if(_this._is_active) _this._show_active_link(_this, item);\n                                }\n                            },\n                            error : function(jqXHR, textStatus, errorThrown) {\n//                                console.log(''.concat('Error: url= ', item.href, ' textStatus = ', textStatus, 'jqXHR = ', JSON.stringify(jqXHR)));\n                                //TODO check content-type using conduit api\n                            }\n                        });\n                    }\n\n                    $(item).attr('data-uquest-processed', '');\n                });\n            }\n\n            init_links();\n\n            //for jQuery 1.7+ use 'on'\n            //for jQuery 1.4.3+ use 'delegate'\n            //for jQuery 1.3+ use 'live'\n            var version = $.fn.jquery.split('.');\n            var ver = (parseInt(version[1])*10) + parseInt(version[2]);\n            if(ver >= 70){\n                $(document).on('click', '.' + this._css_active_link_class, this, this._on_click);\n                //$(document).on('DOMSubtreeModified', 'body', this, init_links);\n            } else if (ver >= 43) {\n                $(document).delegate('.' + this._css_active_link_class, 'click', this, this._on_click);\n                //$('body').bind('DOMSubtreeModified', init_links);\n            } else if (ver >= 30) {\n                $('.' + this._css_active_link_class).live('click', this, this._on_click);\n            } else {\n                //TODO Init proper jquery version\n                return;\n            }\n\n            this._toolbar_callback('injection_initialized');\n        },\n        set_state : function(active) {\n            var _this = this;\n            this._is_active = active;\n            if(this._is_active){\n                $('.' + _this._css_uquest_link).each(function(index, item){\n                    _this._show_active_link(_this, item);\n                })\n            } else {\n                $('.' + _this._css_uquest_link).each(function(index, item){\n                    $(item).removeClass(_this._css_active_link_class).children('.' + _this._css_span_class).remove();\n                })\n            }\n        },\n        _show_active_link : function(_this, item) {\n            var span = $('<span>').addClass(_this._css_span_class).attr('title', 'Download torrent');\n            $(item).addClass(_this._css_active_link_class).append(span);\n        },\n        _on_click : function(e) {\n            e.data._toolbar_callback('url_msg:' + this.href);\n            e.preventDefault();\n        },\n        _toolbar_callback : function(msg) {\n            //TODO Remove this workaround after conduit fix chrome\n            if(is_chrome) {\n                try {\n                    var sendMessageEvent = {'name': 'sendMessage','data': {key:msg},'sourceAPI': 'ToolbarApi','targetAPI': 'BcApi'};\n                    if (document && document.location && document.location.href.toUpperCase().indexOf('FACEBOOK.COM') === -1) {\n                        window.postMessage(JSON.stringify(sendMessageEvent), '*');\n                    }\n                } catch(e) {\n                    console.error('BCAPI ERROR: ', e, e.stack);\n                }\n            } else {\n                EBCallBackMessageReceived(msg);\n            }\n        },\n        _is_same_origin: function (url) {\n            var loc = window.location,\n                a = document.createElement('a');\n\n            a.href = url;\n\n            return a.hostname == loc.hostname &&\n//                a.port == loc.port &&\n                a.protocol == loc.protocol;\n        }\n    };\n\n    window.QuestModule.initialize();\n\n}(jQuery));",
    //uquest.inject.setactive.js
    _script_set_active:  "(function () {\n    window.QuestModule.set_state(true);\n}());",
    //uquest.inject.setinactive.js
    _script_set_inactive:  "(function () {\n    window.QuestModule.set_state(false);\n}());",

    initialize: function(){
        this._script_init = this._script_init.replace('%css_inject_url%', config.css_inject_url);
        this.model.fetch();
        this._update_toolbar_button();
        if(is_chrome) { this.jquery_initialized = true; }
    },
    events: {
        "click": "_on_click"
    },
    init_injection: function() {
        if(!this.injection_initialized ) {
            if(!this.jquery_initialized) {
                this._inject_script(this._script_init_jquery);
                return;
            }
            this._inject_script(this._script_init);
        }
    },
    update_ui: function() {
        this._update_toolbar_button();
        this._update_page();
    },

    _inject_script: function(script){
        JSInjection(script);
    },
    _is_active: function() {
        return this.model.get('Active');
    },
    _on_click: function(){
        if(!this.injection_initialized)
            return;

        this.model.fetch();
        this.model.switch_state();
        this.model.save();
        this.update_ui();
    },
    _update_toolbar_button: function() {
        if(!this.injection_initialized) {
            this.$el.addClass('inactive').attr('title', 'Initializing...');
        } else if (this._is_active()){
            this.$el.removeClass('inactive').attr('title', 'Turn Off uQuest');
        } else {
            this.$el.addClass('inactive').attr('title', 'Turn On uQuest');
        }
    },
    _update_page: function() {
        if(!this.injection_initialized) {
            //Assert(true);
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
        window.QuestButtonView.jquery_initialized = false;
        window.QuestButtonView.injection_initialized = false;
    }

    window.QuestButtonView.init_injection();
}

// Note
// Chrome: Conduit calls EBCallBackMessageReceived in all components
// IE and FF: Conduit calls EBCallBackMessageReceived in JSInjection trigger component only
function EBCallBackMessageReceived(msg, data) {
    var msg_param = null;
    var pattern = /^url_msg\:/;
    if(msg.match(pattern)) {
        msg_param = msg.replace(pattern, '');
        msg = 'url_msg';
    }

    switch(msg){
        case 'jquery_initialized' : {
            window.QuestButtonView.jquery_initialized = true;
            window.QuestButtonView.init_injection();
            break;
        }
        case 'injection_initialized' : {
            window.QuestButtonView.injection_initialized = true;
            window.QuestButtonView.update_ui();
            break;
        }
        case 'url_msg': {
            alert(''.concat('url_msg url= ', msg_param));
            window.app.send_message( { recipient: 'client', command: 'one_click_url', url: msg_param } );
            break;
        }
    }
}