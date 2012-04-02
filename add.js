jQuery(document).ready( function() {

    window.clients = new ClientCollection;

    clients.fetch();

    function do_add() {
        console.log('clicked upload button');
        var url = jQuery('#url_input').val();
        if (url) {
            var msg = { 'command': 'add_by_url', 'url': url };
            BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
            jQuery('#url_input').val('');
            custom_track('add_torrent');
            BTCloseFloatingWindow();
        }
    }

    $('#button_upload').click( do_add );
    $('#url_input').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_add()
        }
    });


} );