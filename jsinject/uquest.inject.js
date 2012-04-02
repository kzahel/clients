(function ($) {
    var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));

    window.QuestModule = {
        _is_active : false,
        _selector : 'a',
//        _selector : 'a[href$=\".torrent\"],a[href^=\"magnet:?xt=urn:btih\"]',
        _css_link_class : 'utorrent-uquest-inject',
        _css_span_class : 'utorrent-uquest-span',

        initialize : function() {
            //TODO url path from config
            var host = 'http://localhost/toolbar2/';
            $('<link>').attr('type', 'text/css').attr('rel', 'stylesheet')
                .attr('href', host + 'css/style_inject.css')
                .appendTo('head');

            //for jQuery 1.7+ use 'on'
            //for jQuery 1.4.3+ use 'delegate'
            //for jQuery 1.3+ use 'live'
            var version = $.fn.jquery.split('.');
            var ver = (parseInt(version[1])*10) + parseInt(version[2]);
            if(ver >= 70){
                $(document).on('click', '.' + this._css_link_class, this, this._on_click);
            } else if (ver >= 43) {
                $(document).delegate('.' + this._css_link_class, 'click', this, this._on_click);
            } else if (ver >= 30) {
                $('.' + this._css_link_class).live('click', this, this._on_click);
            } else {
                //TODO Init proper jquery version
                return;
            }

            this._toolbar_callback('injection_initialized');
        },
        set_state : function(active) {
            this._is_active = active;
            var span_class = this._css_span_class;
            var link_class = this._css_link_class;
            if(this._is_active){
                $(this._selector).each(function(){
                    var span = $('<span>').addClass(span_class).attr('title', 'Download torrent');
                    $(this).addClass(link_class).append(span);
                })
            } else {
                $(this._selector).each(function(){
                    $(this).removeClass(link_class).children(span_class).remove();
                })
            }
        },
        _on_click : function(e) {
            e.data._toolbar_callback('url_msg:' + this.href);
            e.preventDefault();
        },
        _toolbar_callback : function(msg) {
            //TODO Remove this workaround after conduit fix chrome
            if(is_chrome) {
                try {
                    var sendMessageEvent = {'name': 'sendMessage','data': {key:msg},'sourceAPI': 'ToolbarApi','targetAPI': 'BcApi'};
                    if (document && document.location && document.location.href.toUpperCase().indexOf('FACEBOOK.COM') === -1) {
                        window.postMessage(JSON.stringify(sendMessageEvent), '*');
                    }
                } catch(e) {
                    console.error('BCAPI ERROR: ', e, e.stack);
                }
            } else {
                EBCallBackMessageReceived(msg);
            }
        }
    };

    window.QuestModule.initialize();

}(jQuery));