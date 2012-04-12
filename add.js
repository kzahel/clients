jQuery(document).ready( function() {

    window.clients = new ClientCollection;
    window.app = new App( { type: 'add' } );
    clients.fetch();
    clients.init_post_fetch();
    client = clients.selected;

    function do_add() {
        console.log('clicked upload button');
        var url = jQuery('#url_input').val();
        if (url) {
            // XXX -- this causes each browser tab to do the add.
            app.send_message( { recipient: 'client', command: 'add_by_url', 'url': url } );
            //app.send_message( { recipient: 'add', command: 'add_by_url', 'url': url }, {local:true} );
            //var msg = { 'command': 'add_by_url', 'url': url };
            //BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
            jQuery('#url_input').val('');
            custom_track('add_torrent');
            setTimeout( function() {
                BTCloseFloatingWindow();
            }, 400); // is this enough time for the add-url request to be sent through remote?
        }
    }

    $('#button_upload').click( do_add );
    $('#url_input').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_add()
        }
    });


} );