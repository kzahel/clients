window.QuestModule = (function () {
    //private properties
    var _$ = null;
    var _is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));
    var _is_ie = navigator.userAgent.match(/MSIE/);
    var _css_url = null;
    var _css_ie_fix_url = null;
    var _img_icon_path = null;
    var _is_active = false;
    var _selector_new_link = 'a:not([data-uquest-processed])';
    var _css_uquest_link = 'utorrent-uquest-link';
    var _css_active_link_class = 'utorrent-uquest-active';
    var _css_uquest = 'uquest';

    //private methods
    //public methods handlers section
    function _initialize(){
        var css_inject_path = window.QuestModuleInitSettings.css_inject_path;
        var css_version = window.QuestModuleInitSettings.css_version;
        _css_url = ''.concat(css_inject_path, 'style_inject.css?v=', css_version);
        _css_ie_fix_url = ''.concat(css_inject_path, 'style_inject_iefix.css?v=', css_version);
        _img_icon_path = ''.concat(css_inject_path, 'images/toolbar/dl_icon.png');
        _is_active = window.QuestModuleInitSettings.is_active;

        _init_jQuery(function(){
            _init_css();
            _init_links();
            _init_event_handlers();
            _toolbar_callback('injection_initialized:' + _$('.' + _css_uquest_link).length);
        });
    }

    function _set_state(active) {
        _is_active = active;
        if(_is_active){
            _$('.' + _css_uquest_link).each(function(index, item){
                _show_active_link(item);
            })
        } else {
            _$('.' + _css_uquest_link).each(function(index, item){
                _$(item).removeClass(_css_active_link_class).children('.' + _css_uquest).remove();
            })
        }
    }

    //init section
    function _init_jQuery(jQuery_initialized_callback) {
        if (_get_jQuery_version() < 151) { //Conduit uses jQuery ver 1.5.1 in Chrome
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';

            function script_loaded_callback(){
                script.onload = script.onreadystatechange = null;
                _$ = jQuery.noConflict(true);
                jQuery_initialized_callback();
            }

            if(script.onreadystatechange !== undefined){//ie fix
                script.timer = setInterval( function(){
                        if (script.readyState == 'loaded' || script.readyState == 'complete'){
                            clearInterval(script.timer);
                            script_loaded_callback();
                        }
                    }, 100
                );
            } else { //all other browsers
                script.onload = script_loaded_callback;
            }

            script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
            head.appendChild(script);
        } else {
            _$ = window.jQuery;
            jQuery_initialized_callback();
        }
    }

    function _init_css() {
        function load_css (css_url) {
            if(_$('head link[href=\"' + css_url + '\"]').length == 0) {
                _$('<link>').attr('type', 'text/css').attr('rel', 'stylesheet')
                    .attr('href', css_url)
                    .appendTo('head');
            }
        }
        load_css(_css_url);
        if(_is_ie) {
            load_css(_css_ie_fix_url);
        }
    }

    function _init_links() {
        _$(_selector_new_link).each(function(index, item){
            var url_parts = item.href.split('?');
            //is direct link?
            if(url_parts[0].match(/[\.]torrent$|^magnet\:/i)) {
//                        console.log(''.concat('direct torrent link ', item.href, ' ', _$(item).text()));
                _$(item).addClass(_css_uquest_link);
                if(_is_active) _show_active_link(item);
            //does contain torrent or download text, not exe and from the same origin?
            } else if (_$(item).text().match(/torrent|download/i) &&
                !url_parts[0].match(/[\.]exe$|[\.]pdf$/i) &&
                _is_same_origin(item)) {
//                        console.log(''.concat('before ajax ', item.href, ' ', _$(item).text()));
                _$.ajax({
                    type : 'HEAD',
                    url: item.href,
                    dataType: 'json',
                    async: true,
                    complete: function(resp){
//                                debugger;
//                                if(resp.status == 302) {
//                                    console.log(''.concat('url= ', item.href, ' data.redirect = ', resp.getResponseHeader('Location')));
//                                }

//                                console.log(''.concat('ResponseHeader: ', resp.getAllResponseHeaders(), ' url= ', item.href));
                        if(resp.getResponseHeader('Content-Type') == 'application/x-bittorrent') {
                            _$(item).addClass(_css_uquest_link);
                            if(_is_active) _show_active_link(item);
                        }
                    },
                    error : function(jqXHR, textStatus, errorThrown) {
//                                console.log(''.concat('Error: url= ', item.href, ' textStatus = ', textStatus, 'jqXHR = ', JSON.stringify(jqXHR)));
                        //TODO check content-type using conduit api
                    }
                });
            }

            _$(item).attr('data-uquest-processed', '');
        });
    }

    function _init_event_handlers() {
        //for jQuery 1.7+ use 'on'
        //for jQuery 1.4.3+ use 'delegate'
        var ver = _get_jQuery_version(_$);
        if(ver >= 170){
            _$(document).on('click', '.' + _css_active_link_class, this, _on_click);
            _$(document).on('hover', '.' + _css_uquest, this, _on_mouse_hover);
            //_$(document).on('DOMSubtreeModified', 'body', this, init_links);
        } else if (ver >= 143) {
            _$(document).delegate('.' + _css_active_link_class, 'click', this, _on_click);
            _$(document).delegate('.' + _css_uquest, 'hover', this, _on_mouse_hover);
            //_$('body').bind('DOMSubtreeModified', init_links);
        } else {
            debugger;
            assert(false);
            return;
        }
    }

    //event handlers section
    function _on_click(e) {
        _toolbar_callback('url_msg:' + this.href);
        e.preventDefault();
    }

    function _on_mouse_hover(e) {
        if( e.type === 'mouseenter' ) {
            _$(this).find('.tip_content').show(10);
        } else {
            _$(this).find('.tip_content').hide(10);
        }
    }

    //utils section
    function _show_active_link(item) {
        var tip_text = item.title;
        if(tip_text.length == 0){
            if(_is_ie) {
                tip_text = item.innerText;
//            } else if (_is_chrome) {
//                tip_text = item.text.replace(/[^a-zA-Z0-9]+/g, ' ');
            } else {
                tip_text = item.text;
            }
        }
        tip_text = '<b>Download</b>&nbsp' + tip_text.replace(/^download|^get/i, '');
/*
        var uquest = ''.concat(
            '<div class=\"uquest\"><div class=\"uquest_highlight\"><div class=\"uquest_red\"><div class=\"uquest_tip\"><img align=\"top\" src=\"',
            _img_icon_path,
            '\"><div class=\"tip_content\">',
            tip_text,
            '</div></div></div></div><div class=\"uquest_pointer_red\"></div></div>');
*/
        var uquest = _$('<div>').addClass(_css_uquest)
            .append(_$('<div>').addClass('uquest_highlight')
                .append(_$('<div>').addClass('uquest_red')
                    .append(_$('<div>').addClass('uquest_tip')
                        .append(_$('<img>').addClass('dl_image').attr('align', 'top').attr('src', _img_icon_path))
                        .append(_$('<div>').addClass('tip_content').html(tip_text)))))
            .append(_$('<div>').addClass('uquest_pointer_red'));

        _$(item).append(uquest).addClass(_css_active_link_class);
    }

    function _get_jQuery_version(jQueryObj) {
        var version;
        if (typeof jQuery == 'undefined' && jQueryObj == undefined){
            return -1;
        } else if(jQueryObj){
            version = jQueryObj.fn.jquery.split('.');
        } else {
            version = window.jQuery.fn.jquery.split('.');
        }
        return (parseInt(version[0])*100) + (parseInt(version[1])*10) + parseInt(version[2]);
    }

    function _is_same_origin (url) {
        var loc = window.location,
            a = document.createElement('a');

        a.href = url;

        return a.hostname == loc.hostname &&
//                a.port == loc.port &&
            a.protocol == loc.protocol;
    }

    function _toolbar_callback(msg) {
        //TODO Remove this workaround after conduit fix chrome
        if(_is_chrome) {
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

    return {
        //public section
        initialize : _initialize,
        set_state : _set_state
    };
}());

window.QuestModule.initialize();
