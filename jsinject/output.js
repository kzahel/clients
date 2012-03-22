/* uquest.inject.js */
"(function () {\n    var uQuest = {\n        _is_active : true,\n        _selector : 'a',\n        _class : 'utorrent-uquest-inject',\n        init : function() {\n        },\n        set_state : function(active) {\n            this._is_active = active;\n            if(this._is_active){\n                jQuery(this._selector).addClass(this._class);\n            } else {\n                jQuery(this._selector).removeClass(this._class);\n            }\n        }\n    };\n\n    window.QuestModule = uQuest;\n    uQuest.init();\n\n}());"

/* uquest.inject.setactive.js */
"(function () {\n    window.QuestModule.set_state(true);\n}());"

/* uquest.inject.setinactive.js */
"(function () {\n    window.QuestModule.set_state(false);\n}());"

