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
        this.set("Active", !this.get("Active"));
    },
    localStorage: new Store("QuestSettings")
});

var QuestView = Backbone.View.extend({
    el: "#uquest_button",
    jquery_initialized: false,
    injection_initialized: false,

    //uquest.init_jquery.js
    _script_init_jquery:  "(function() {\n    if (typeof jQuery == 'undefined') {\n        var head = document.getElementsByTagName('head')[0];\n        var script = document.createElement('script');\n        script.type = 'text/javascript';\n\n        function callback(){\n            script.onload = script.onreadystatechange = null;\n            EBCallBackMessageReceived('jquery_initialized');\n        };\n\n        if(script.onreadystatechange !== undefined){//ie fix\n            script.timer = setInterval( function(){\n                    if (script.readyState == 'loaded' || script.readyState == 'complete'){\n                        clearInterval(script.timer);\n                        callback();\n                    }\n                }, 100\n            );\n        } else { //all other browsers\n            script.onload = callback;\n        }\n\n        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';\n        head.appendChild(script);\n    } else {\n        EBCallBackMessageReceived('jquery_initialized');\n    }\n\n}());",
    //uquest.inject.js
    _script_init:  "(function () {\n    window.QuestModule = {\n        _is_active : true,\n        _selector : 'a',\n        init : function() {\n            /*TODO use jquery. At the moment jQuery may not be initialized here*/\n            /*TODO url path from config*/\n            var el = document.createElement('link');\n            el.setAttribute('type', 'text/css');\n            el.setAttribute('rel', 'stylesheet');\n            el.setAttribute('href', 'http://localhost/toolbar2/css/style_inject.css');\n            document.getElementsByTagName('head')[0].appendChild(el);\n/*          el.setAttribute('type', 'text/css');\n            el.innerHTML = '.utorrent-uquest-inject { background-color: yellow };';\n*/\n        },\n        set_state : function(active) {\n            this._is_active = active;\n            if(this._is_active){\n                jQuery(this._selector).each(function(){\n                    var span = jQuery('<span>').addClass('utorrent-uquest-span').attr('title', 'Download torrent');\n                    jQuery(this).addClass('utorrent-uquest-inject').append(span);\n                })\n            } else {\n                jQuery(this._selector).each(function(){\n                    jQuery(this).removeClass('utorrent-uquest-inject').children('.utorrent-uquest-span').remove();\n                })\n            }\n        }\n    };\n\n    window.QuestModule.init();\n}());",
    //uquest.inject.setactive.js
    _script_set_active:  "(function () {\n    window.QuestModule.set_state(true);\n}());",
    //uquest.inject.setinactive.js
    _script_set_inactive:  "(function () {\n    window.QuestModule.set_state(false);\n}());",

    initialize: function(){
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
            this.injection_initialized = true;
            this._update_toolbar_button();
        }
    },
    _inject_script: function(script){
        JSInjection(script);
    },
    _is_active: function() {
        return this.model.get("Active");
    },
    _on_click: function(){
        if(!this.injection_initialized)
            return;

        this.model.fetch();
        this.model.switch_state();
        this.model.save();
        this._update_toolbar_button();
        this._update_page();
    },
    _update_toolbar_button: function() {
        if(!this.injection_initialized) {
            this.$el.addClass("inactive").attr('title', 'Initializing...');
            return;
        }

        if(this._is_active()){
            this.$el.removeClass("inactive").attr('title', 'Turn Off uQuest');
        } else {
            this.$el.addClass("inactive").attr('title', 'Turn On uQuest');
        }
    },
    _update_page: function() {
//        this.init_injection();
        if(this._is_active()){
            this._inject_script(this._script_set_active);
        } else {
            this._inject_script(this._script_set_inactive);
        }
    }
});

jQuery(document).ready(function () {
    // doesnt work correctly in chrome (cant set window attributes)
    if (is_chrome) {
        // call EBDocumentComplete manually for chrome...
        EBDocumentComplete();
    }
});

function EBDocumentComplete() {
//    injstr = "var scr = document.createElement('link'); scr.setAttribute('rel', 'stylesheet'); scr.setAttribute('type', 'text/css'); scr.setAttribute('href', 'aaa.css'); document.getElementsByTagName('head')[0].appendChild(scr);";
//    JSInjection(injstr);
//    JSInjection("debugger; alert('ffff'); EBCallBackMessageReceived('888');");

//    var script = "var scr = document.createElement('script'); scr.setAttribute('src', 'uquest.inject3.js'); document.getElementsByTagName('head')[0].appendChild(scr);";
//    JSInjection(script);
//    JSInjection("document.body.style.background='#f00'; EBCallBackMessageReceived('888', 'aaa');");

//    alert('window.QuestButtonView ' + window.QuestButtonView);

    if(!window.QuestButtonView) {
        window.QuestButtonView = new QuestView( {model: new QuestSettings({ id: 1 })});
    } else {
        //IE and FF fix
        window.QuestButtonView.jquery_initialized = false;
        window.QuestButtonView.injection_initialized = false;
    }

    window.QuestButtonView.init_injection();
}

function EBCallBackMessageReceived(msg, data) {
    switch(msg){
        case "jquery_initialized" : {
            window.QuestButtonView.jquery_initialized = true;
            window.QuestButtonView.init_injection();
            break;
        }
    }
}