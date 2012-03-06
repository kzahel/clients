jQuery(document).ready( function() {

    ChangeWidth(config.torrent_pane_width);

    RegisterForMessaging(config.conduit_toolbar_message_key_slave);

    window.clients = new ClientCollection;

    clients.fetch();

    jQuery('#torrent_list').click( function(evt) {
        BTOpenGadget('torrents.html', 400, 344, { openposition: 'offset:(0;30)' });
    });


    jQuery('#red_button').click( function(evt) {
        BTOpenGadget('add.html', 395, 118, { openposition: 'offset:(25;30)' });
    });


} );