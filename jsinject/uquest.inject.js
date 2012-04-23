window.QuestModule = (function ($) {
    //private properties
    var _is_active = false;
    var _selector_new_link = 'a:not([data-uquest-processed])';
//        _selector_direct_link : 'a[href$=\".torrent\"],a[href^=\"magnet:?xt=urn:btih\"]',
    var _css_uquest_link = 'utorrent-uquest-link';
    var _css_active_link_class = 'utorrent-uquest-active';
    var _css_span_class = 'utorrent-uquest-span';

    //private methods
    function _init_css() {
        var css_url = '%css_inject_url%';
        if($('head link[href=\"' + css_url + '\"]').length == 0) {
            $('<link>').attr('type', 'text/css').attr('rel', 'stylesheet')
                .attr('href', css_url)
                .appendTo('head');
        }
    }

    function _init_links() {
        $(_selector_new_link).each(function(index, item){
            var url_parts = item.href.split('?');
            //is direct link?
            if(url_parts[0].match(/\.torrent$|^magnet\:/i)) {
//                        console.log(''.concat('direct torrent link ', item.href, ' ', $(item).text()));
                $(item).addClass(_css_uquest_link);
                if(_is_active) _show_active_link(item);
                //is contain torrent or download text, not exe and from the same origin?
            } else if ($(item).text().match(/torrent|download/i) &&
                !url_parts[0].match(/\.exe$|\.pdf$/i) &&
                _is_same_origin(item)) {
//                        console.log(''.concat('before ajax ', item.href, ' ', $(item).text()));
                $.ajax({
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
                            $(item).addClass(_css_uquest_link);
                            if(_is_active) _show_active_link(item);
                        }
                    },
                    error : function(jqXHR, textStatus, errorThrown) {
//                                console.log(''.concat('Error: url= ', item.href, ' textStatus = ', textStatus, 'jqXHR = ', JSON.stringify(jqXHR)));
                        //TODO check content-type using conduit api
                    }
                });
            }

            $(item).attr('data-uquest-processed', '');
        });
    }

    function _init_event_handlers() {
        //for jQuery 1.7+ use 'on'
        //for jQuery 1.4.3+ use 'delegate'
        var ver = get_jQuery_version(window.jQueryInjected);
        if(ver >= 170){
            $(document).on('click', '.' + _css_active_link_class, this, _on_click);
            //$(document).on('DOMSubtreeModified', 'body', this, init_links);
        } else if (ver >= 143) {
            $(document).delegate('.' + _css_active_link_class, 'click', this, _on_click);
            //$('body').bind('DOMSubtreeModified', init_links);
        } else {
            debugger;
            assert(false);
            return;
        }
    }

    function _show_active_link(item) {
        var span = $('<span>').addClass(_css_span_class).attr('title', 'Download torrent');
        $(item).addClass(_css_active_link_class).append(span);
    }

    function _on_click(e) {
        toolbar_callback('url_msg:' + this.href);
        e.preventDefault();
    }

    function _is_same_origin (url) {
        var loc = window.location,
            a = document.createElement('a');

        a.href = url;

        return a.hostname == loc.hostname &&
//                a.port == loc.port &&
            a.protocol == loc.protocol;
    }

    return {
        //public section
        initialize : function() {
            _init_css();
            _init_links();
            _init_event_handlers();
            toolbar_callback('injection_initialized');
        },
        set_state : function(active) {
            _is_active = active;
            if(_is_active){
                $('.' + _css_uquest_link).each(function(index, item){
                    _show_active_link(item);
                })
            } else {
                $('.' + _css_uquest_link).each(function(index, item){
                    $(item).removeClass(_css_active_link_class).children('.' + _css_span_class).remove();
                })
            }
        }
    };
}(jQueryInjected));

window.QuestModule.initialize();
