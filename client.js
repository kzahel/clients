var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));

function EBCallBackMessageReceived(msg, data) {
    clients.selected.doreq( { action: 'add-url', s: msg } );
    console.log('oneclick success');
    custom_track('oneclickadd');
}

function EBDocumentComplete() {
    var track_all_urls = false;
    var frame_url = GetMainFrameUrl(); // XXX - Not working in MSIE
                                       // for "controlstaging"
                                       // toolbar. Conduit says it
                                       // should be. But it isn't.
    var frame_title = GetMainFrameTitle();
    var bittorrent_login = config.autologin_url.replace('utorrent.com','bittorrent.com');
    var utorrent_login = config.autologin_url;

    if (navigator.userAgent.match(/MSIE/)) { debugger; }
    console.log('checking if should inject autologin', utorrent_login, frame_url.slice( 0, bittorrent_login.length ));
    if ( frame_url.slice( 0, bittorrent_login.length ) == bittorrent_login ||
         frame_url.slice( 0, utorrent_login.length ) == utorrent_login ) {
             do_autologin_injection();
    }

    if (track_all_urls) {
        j = JSON.stringify( {url:frame_url,title:frame_title} );
        var injstr = 'document.body.style.background="#f00"; EBCallBackMessageReceived('+j+');'
        JSInjection(injstr);
        //JSInjection('document.body.style.background="#f00";');
    }
    var oneclickadd = true
    if (oneclickadd) {
        // TODO -- only inject on "web pages" (i.e. not on http://foo.com/image.jpg)
        // TODO -- don't store the inline code here. Unfortunately this means we'd have to run a build script every time changes were made.
        // FIX -- not working in chrome.
        var injstr = 'var elts = document.getElementsByTagName("a"); \nfor (var i=0;i<elts.length;i++){\nelts[i].onclick = function(evt) { \nvar url = this.href; \nif (url.substring(url.length-".torrent".length,url.length) == ".torrent" || url.substring(0,"magnet:?xt=urn:btih".length) == "magnet:?xt=urn:btih" ) { \n\n\n\nEBCallBackMessageReceived(url);\n\n\n if (evt){evt.preventDefault();} else { return false; }\n }};}';
        JSInjection(injstr);
    }
}

function do_autologin_injection() {
    var cur_client = clients.selected;
    if (cur_client) {
        // XXX - this data needs to have some unit tests.
        var data = cur_client.get('data');
        if (cur_client.get('type') == 'local') { 
            var sessions = {};
            var guid = null;
            sessions[data.key] = { pairing_port: data.port };
            sessions.current = null

            var enc_keys = {};
            enc_keys[guid] = data.key;

        } else {
            var sessions = {}
            var guid = data.guid || null;

            sessions[guid] = { u: data.bt_user,
                               c: data.cid,
                               t: data.bt_talon_tkt
                             };
            sessions.current = guid;
            var enc_keys = {};
            enc_keys[guid] = data.key;
        }
        var args = { current_client: { type: cur_client.get('type'), key: guid }, type: 'autologin', sessions: sessions, enc_keys: enc_keys };

        console.log('injecting autologin script');

        if (is_chrome) {
            // chrome, things set on window are not available for some
            // reason! however, changes to dom still work. so put
            // everything in a script tag.
            var call_login = 'if (window.clients && ! window.clients._called_autologin) { debugger; \nclients.do_autologin();}';
            var toinject = 'debugger;\nvar s = document.createElement("script"); \ns.setAttribute("id","autologin_data_script"); \ns.innerText="debugger;var autologin_data='+JSON.stringify(args).replace(/"/g,'\\"')+';setInterval(function(){'+call_login.replace(/\n/g,'\\n')+'},100)"; \nif(document.head){\ndocument.head.appendChild(s)\n}else{\ndebugger;};';

        } else {
            // can simply set window variables and have them accessible to the main script.
            JSInjection('debugger;\nwindow.autologin_data = '+JSON.stringify(args)+';\n if (window.clients && ! window.clients._called_autologin) {\n clients.do_autologin(); \n};\n');
        }


        JSInjection(toinject);
    }
}


jQuery(document).ready( function() {
    jQuery('.ut_icon_link').attr('href',config.autologin_url);

    var frame_url = GetMainFrameUrl();


    myconsole.log('client.js'  + frame_url);
    //ChangeWidth(config.client_pane_width);

    window.app = new App( { type: 'client' } );
    window.clients = new ClientCollection;

    clients.fetch(); 
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {
        var data = client.get('data');
        if (! data.key) {
            // client.pair(); // manually trigger this
        }
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
    } else {

        jQuery('#computerselect').text('Disabled')
        // no client, still allow dropdown..
    }

/*
// this wasn't working very well so when client changes we just reload the whole page.
    clients.bind('selected', function(client) {
        return; // we get messages...
        if (window.clientview) {
            if (clientview.model.id == client.id) {
                return;
            } else {
                clientview.destroy()
            }
        }
        // should subclass clientview, activeclientview...
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
    });
*/

    jQuery('#computerselect').live('click', function(evt) {
        BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
    });


/*
// commented out--whole page reloads instead
    clients.bind('destroy', function(client) {
        debugger;
        window.clientview = new ClientView( { el: $('#computerselect'), model: null } );
    });
*/


    if (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i)) {
        // call EBDocumentComplete manually for chrome...
        EBDocumentComplete();
    }


} );