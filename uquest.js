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

    _injection_initialized: false,
    //uquest.inject.js
    _script_init: "(function () {\n    var uQuest = {\n        _is_active : true,\n        _selector : 'a',\n        _class : 'utorrent-uquest-inject',\n        init : function() {\n        },\n        set_state : function(active) {\n            this._is_active = active;\n            if(this._is_active){\n                jQuery(this._selector).addClass(this._class);\n            } else {\n                jQuery(this._selector).removeClass(this._class);\n            }\n        }\n    };\n\n    window.QuestModule = uQuest;\n    uQuest.init();\n\n}());",
    //uquest.inject.setactive.js
    _script_set_active: "(function () {\n    window.QuestModule.set_state(true);\n}());",
    //uquest.inject.setinactive.js
    _script_set_inactive: "(function () {\n    window.QuestModule.set_state(false);\n}());",

    initialize: function(){
        this.model.fetch();
        this._update_toolbar_button();
        if(is_chrome) { this.jquery_initialized = true; }
    },
    events: {
        "click": "_on_click"
    },
    init_injection: function() {
        if(!this._is_injected() ) {
            if(!this.jquery_initialized) {
                //TODO Check whether jquery already exists
                //TODO Load jquery script synchronously
                var jquery_script = "var scr = document.createElement('script'); scr.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'); document.getElementsByTagName('head')[0].appendChild(scr); EBCallBackMessageReceived('jquery_initialized');";
                JSInjection(jquery_script);
                return;
            }
            //TODO css injection
            this._inject_script(this._script_init);
            this._injection_initialized = true;
        }
    },
    _inject_script: function(script){
        JSInjection(script);
    },
    _is_active: function() {
        return this.model.get("Active");
    },
    _is_injected: function() {
//        $("script[src*='" + this._script_name_init + "']").length > 0;
        return this._injection_initialized;
    },
    _on_click: function( ){
        this.model.fetch();
        this.model.switch_state();
        this.model.save();
        this._update_toolbar_button();
        this._update_page();
    },
    _update_toolbar_button: function() {
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

    window.QuestButtonView = new QuestView( {model: new QuestSettings({ id: 1 })});
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