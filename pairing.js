jQuery(document).ready( function() {
    window.clients = new ClientCollection;
    clients.fetch();
    clients.init_post_fetch();

    var client = clients.selected; // want to allow pair for non-selected too... make get the id out of the url...
    if (client) {
        function on_pair_response(jqevt) {
            var evt = jqevt.originalEvent;
            console.log('postmessage on window',evt.origin, evt.data);
            if (evt.data.key) {
                var d = client.get('data');
                d.key = evt.data.key;
                d.type = 'local';
                client.set('data', d);
                client.save();
                custom_track('pairing_iframe_allow');
                //clients.add(client); // was already added
                //clients.set_active(client)
                CloseFloatingWindow();
            } else {
                custom_track('pairing_iframe_deny');
                console.error('pairing DEnied');
                CloseFloatingWindow();
            }
            $('#pairing_view').html('');
            jQuery(window).off('message', on_pair_response);
        }

        //var url = 'http://127.0.0.1:' + client.get('data').port + '/gui/pair';//?iframe=' + encodeURIComponent(window.location.href);
        var url = 'http://127.0.0.1:' + client.get('data').port + '/gui/pair?iframe=' + 'foobar&style=foo';
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.setAttribute('style','width:300px; height:250px; border: 0px; overflow:hidden;');
        iframe.id="pairing_frame";
        //var iframe = $('#pairing_frame')[0];
        document.getElementById('pairing_view').appendChild(iframe);
        custom_track('pairing_iframe_show');
        //window.addEventListener('message', this.on_pair_response, false);
        jQuery(window).on('message', on_pair_response);
    }
} );