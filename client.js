jQuery(document).ready( function() {

    ChangeWidth(config.client_pane_width);

    window.app = new App( { type: 'client' } );
    window.clients = new ClientCollection;

    clients.fetch(); 
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {
        $('.computer_name').text( client.get_name() );
    }

    clients.bind('selected', function(client) {
        $('.computer_name').text( client.get_name() );
    });

    if (clients.models.length == 0) {
        // init post fetch will scan for clients...
        // BTOpenGadget('pairing.html', 286, 130, { openposition: 'offset:(25;30)' });
    }



    jQuery('#computerselect').click( function(evt) {
        BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
    });


} );