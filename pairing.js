jQuery(document).ready( function() {
    window.clients = new ClientCollection;
    window.app = new App( { type: 'pairing' } );
    clients.fetch();
    clients.init_post_fetch();

    var client = clients.selected; // want to allow pair for non-selected too... make get the id out of the url...
    if (client) {
        function on_pair_response(jqevt) {
            var evt = jqevt.originalEvent;
            console.log('postmessage on window',evt.origin, evt.data);
            if (evt.data.match && evt.data.match(/ToolbarApi/)) {
                // toolbar is sending messages too that conflict with
                // the pairing mechanism, just ignore them.
            } else if (evt.data.length == 40) {
                client.got_key(evt.data);
                custom_track('pairing_iframe_allow');
                //clients.add(client); // was already added on scan
                
                app.broadcast( { message: 'pairing accepted', id: client.id } );
                // need to delay sending this because closefloatingwindow is not working??
                setTimeout( function() {
                    BTCloseFloatingWindow();
                }, 200);
            } else {
                client.set_status('pairing denied');
                client.save();

                app.broadcast( { message: 'pairing denied', id: client.id } );
                // need to delay sending this because closefloatingwindow is not working??
                setTimeout( function() {
                    BTCloseFloatingWindow();
                }, 200);
            }
            // $('#pairing_view').html('');
            // jQuery(window).off('message', on_pair_response);
        }

        //var url = 'http://127.0.0.1:' + client.get('data').port + '/gui/pair';//?iframe=' + encodeURIComponent(window.location.href);
        var url = 'http://127.0.0.1:' + client.get('data').port + '/gui/pair?iframe=Control'); // &style is broken

        if (config.fake_pairing) {
            url = 'client_html/pairing.html';
        }

        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.setAttribute('style','width:'+config.pairing_iframe_width+'; height:'+config.pairing_iframe_height+'; border: 0px; overflow:hidden;');
        iframe.id="pairing_frame";
        //var iframe = $('#pairing_frame')[0];
        document.getElementById('pairing_view').appendChild(iframe);
        custom_track('pairing_iframe_show');
        //window.addEventListener('message', this.on_pair_response, false);
        jQuery(window).on('message', on_pair_response);
    }
} );