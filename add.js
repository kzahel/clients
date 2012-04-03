jQuery(document).ready( function() {

    window.clients = new ClientCollection;
    window.app = new App( { type: 'add' } );
    clients.fetch();

    function do_add() {
        console.log('clicked upload button');
        var url = jQuery('#url_input').val();
        if (url) {
            app.send_message( { recipient: 'client', command: 'add_by_url', 'url': url } );
            //var msg = { 'command': 'add_by_url', 'url': url };
            //BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
            jQuery('#url_input').val('');
            custom_track('add_torrent');
            setTimeout( function() {
                BTCloseFloatingWindow();
            }, 200);
        }
    }

    $('#button_upload').click( do_add );
    $('#url_input').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_add()
        }
    });


} );