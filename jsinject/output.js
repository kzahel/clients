/* uquest.init_jquery.js */


/* uquest.inject.js */
"(function () {\n    window.QuestModule = {\n        _is_active : true,\n        _selector : 'a',\n        init : function() {\n            /*TODO use jquery. At the moment jQuery may not be initialized here*/\n            /*TODO url path from config*/\n            var el = document.createElement('link');\n            el.setAttribute('type', 'text/css');\n            el.setAttribute('rel', 'stylesheet');\n            el.setAttribute('href', 'http://localhost/toolbar2/css/style_inject.css');\n            document.getElementsByTagName('head')[0].appendChild(el);\n/*          el.setAttribute('type', 'text/css');\n            el.innerHTML = '.utorrent-uquest-inject { background-color: yellow };';\n*/\n        },\n        set_state : function(active) {\n            this._is_active = active;\n            if(this._is_active){\n                jQuery(this._selector).each(function(){\n                    var span = jQuery('<span>').addClass('utorrent-uquest-span').attr('title', 'Download torrent');\n                    jQuery(this).addClass('utorrent-uquest-inject').append(span);\n                })\n            } else {\n                jQuery(this._selector).each(function(){\n                    jQuery(this).removeClass('utorrent-uquest-inject').children('.utorrent-uquest-span').remove();\n                })\n            }\n        }\n    };\n\n    window.QuestModule.init();\n}());"

/* uquest.inject.setactive.js */
"(function () {\n    window.QuestModule.set_state(true);\n}());"

/* uquest.inject.setinactive.js */
"(function () {\n    window.QuestModule.set_state(false);\n}());"

