jQuery(document).ready( function() {

    //ChangeWidth(config.torrent_pane_width);

    window.clients = new ClientCollection;
    
    window.app = new App( { type: 'torrent' } );

    //clients.fetch(); // don't fetch! we will receive messages...

    jQuery('#torrent_list').click( function(evt) {
        BTOpenGadget('torrents.html', 400, 344, { openposition: 'offset:(0;30)' });
    });

    jQuery('#red_button').click( function(evt) {
        BTOpenGadget('add.html', 395, 118, { openposition: 'offset:(25;30)' });
    });


} );