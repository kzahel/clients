jQuery(document).ready( function() {
    //ChangeWidth(config.torrent_pane_width);
    window.clients = new ClientCollection;
    
    window.app = new App( { type: 'files' } );

    clients.fetch(); // don't fetch! we will receive messages...
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {

        // window.torrentsview = new TorrentsView( { el: $('#global_container'), model: client } );
        client.start_updating();
        console.log(client.get('data').key);
    }
} );