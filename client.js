var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));

// Note
// Chrome: Conduit calls EBCallBackMessageReceived in all components 
// IE and FF: Conduit calls EBCallBackMessageReceived in JSInjection trigger component only
function EBCallBackMessageReceived(msg, data) {
//    clients.selected.doreq( { action: 'add-url', s: msg } );
//    console.log('oneclick success');
//    custom_track('oneclickadd');
}

function EBNavigateComplete() {
}

function EBDocumentComplete(url, tabid) {
    var track_all_urls = false;
    var frame_url = GetMainFrameUrl(); // XXX - Not working in MSIE
                                       // for "controlstaging"
                                       // toolbar. Conduit says it
                                       // should be. But it isn't.
    var frame_title = GetMainFrameTitle();
    var bittorrent_login = config.autologin_url.replace('utorrent.com','bittorrent.com');
    var utorrent_login = config.autologin_url;

    //if (navigator.userAgent.match(/MSIE/)) { debugger; }
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

    var oneclickadd = false;
    if (oneclickadd) {
        // TODO -- only inject on "web pages" (i.e. not on http://foo.com/image.jpg)
        // TODO -- don't store the inline code here. Unfortunately this means we'd have to run a build script every time changes were made.
        // FIX -- not working in chrome.

        //var oneclickadd_injstr = 'var elts = document.getElementsByTagName("a"); \nfor (var i=0;i<elts.length;i++){\nelts[i].onclick = function(evt) { \nvar url = this.href; \nif (url.substring(url.length-".torrent".length,url.length) == ".torrent" || url.substring(0,"magnet:?xt=urn:btih".length) == "magnet:?xt=urn:btih" ) { \n\n\n\nEBCallBackMessageReceived(url);\n\n\n if (evt){evt.preventDefault();} else { return false; }\n }};}';
        //JSInjection(oneclickadd_injstr);

//        debugger;

        //JSInjection('document.body.style.background="#f00";');
        //var injstr = 'var elts = document.getElementsByTagName("a"); \nfor (var i=0;i<elts.length;i++){\nelts[i].onclick = function(evt) { \nvar url = this.href; \nif (url.substring(url.length-".torrent".length,url.length) == ".torrent" || url.substring(0,"magnet:?xt=urn:btih".length) == "magnet:?xt=urn:btih" ) { \n\n\n\nEBCallBackMessageReceived(url);\n\n\n if (evt){evt.preventDefault();} else { return false; }\n }};}';
        //JSInjection(injstr);

    }
}


var ClientApp = App.extend({
});

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
            var chrome_autologin_injstr = 'debugger;\nvar s = document.createElement("script"); \ns.setAttribute("id","autologin_data_script"); \ns.innerText="debugger;var autologin_data='+JSON.stringify(args).replace(/"/g,'\\"')+';setInterval(function(){'+call_login.replace(/\n/g,'\\n')+'},100)"; \nif(document.head){\ndocument.head.appendChild(s)\n}else{\ndebugger;};';
            JSInjection(chrome_autologin_injstr);
        } else {
            // can simply set window variables and have them accessible to the main script.
            var autologin_injstr = 'debugger;\nwindow.autologin_data = '+JSON.stringify(args)+';\n if (window.clients && ! window.clients._called_autologin) {\n clients.do_autologin(); \n};\n';
            JSInjection(autologin_injstr);

        }
    }
}


jQuery(document).ready( function() {
    jQuery('.ut_icon_link').attr('href',config.autologin_url);

    var installer_pairing_key = null;

/*
    if (RetrieveGlobalKey("PairingKey")) {
        installer_pairing_key = RetrieveGlobalKey("PairingKey");
    }
    installer_pairing_key = '14793efdc2655183813d6387a737a3019d05f4c7ce'; // test installer flow
*/

    window.app = new ClientApp( { type: 'client' } );
    window.clients = new ClientCollection;

    clients.fetch(); 
    clients.init_post_fetch();
    var client = clients.selected;
    if (client) {
        // XXX -- assert "torrent" app gets notified of what its app should do
        var data = client.get('data');
        if (! data.key) {
            app.send_message( { recipient: 'torrent', command: 'notify_status', status: 'no pairing key', id: client.id } );
            setTimeout( function() {
                app.send_message( { recipient: 'torrent', command: 'collapse' } );
            }, 200);

            // client.pair(); // manually trigger this
        } else {
            client.bind('setstatus', function(status) {
                // js/client.js will handle this
/*
                if (status == 'available') {
                    app.send_message( { command: 'initialize', recipient: 'torrent' } );
                } else {
                    debugger;
                    app.send_message( { recipient: 'torrent', command: 'notify_status', status: status, id: client.id } );
                }
*/
            });
            client.check_status( function() {
                if (client.get('status') != 'available') {
                    // ?
                }
            });
        }
        window.clientview = new ActiveClientView( { el: $('#computerselect'), model: client } );
    } else {
        app.send_message( { command: 'initialize', recipient: 'torrent', options: 'no client' } );
        window.clientview = new ActiveClientView( { el: $('#computerselect'), model: null } );
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


/*
// moved open gadget to active client view logic
    jQuery('#computerselect').live('click', function(evt) {
        BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
    });
*/

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