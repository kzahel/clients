


function EBCallBackMessageReceived(msg, data) {
    debugger;
    console.log('js injection successful',msg);
}


function EBDocumentComplete() {
    var track_all_urls = false;
    //JSInjection('window.foobar=23; EBCallBackMessageReceived("foobar");');
    var frame_url = GetMainFrameUrl();
    var frame_title = GetMainFrameTitle();
    var bittorrent_login = config.autologin_url.replace('utorrent.com','bittorrent.com');
    var utorrent_login = config.autologin_url;

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
}

function do_autologin_injection() {
    var cur_client = clients.get_current_client();
    if (cur_client) {
        var sessions = clients.serialize({cookie:true});
        sessions.current = cur_client.guid; // XXX: "null" is for paired client? hrmmm
        var enc_keys = clients.serialize({window_name:true});
        var args = { current_client: { type: cur_client.connection_type(), key: cur_client.guid }, type: 'autologin', sessions: sessions, enc_keys: enc_keys };
        //clients.sync(sessions, enc_keys); // sets the session cookie... (USELESS -- this is the toolbar!)

        // cookie should be set by clients.serialize hopefully

        console.log('injecting autologin script');
        //JSInjection('window.autologin_data = '+jQuery.toJSON(args)+'; debugger; window.clients.do_autologin();');
        //JSInjection('document.body.style.background="#f00"; debugger; EBCallBackMessageReceived("itworked");');
        //JSInjection('document.body.style = "background:#f00"');
        JSInjection('debugger; window.autologin_data = '+jQuery.toJSON(args)+'; if (window.clients && ! window.clients._called_autologin) { clients.do_autologin(); }; EBCallBackMessageReceived("didautologin");');
    }
}


jQuery(document).ready( function() {
    var frame_url = GetMainFrameUrl();

    if (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i)) {
        // call EBDocumentComplete manually for chrome...
        EBDocumentComplete();
    }

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
        // no client, still allow dropdown..
    }

/*
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
    clients.bind('destroy', function(client) {
        debugger;
        window.clientview = new ClientView( { el: $('#computerselect'), model: null } );
    });
*/



} );