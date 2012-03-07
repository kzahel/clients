jQuery(document).ready( function() {

    //ChangeWidth(config.client_pane_width);

    window.app = new App( { type: 'client' } );
    window.clients = new ClientCollection;

    clients.fetch(); 
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
    }

    clients.bind('selected', function(client) {
        debugger;
        // destroy old clientview ?
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
    });
    clients.bind('destroy', function(client) {
        debugger;
        window.clientview = new ClientView( { el: $('#computerselect'), model: null } );
    });

    if (clients.models.length == 0) {
        // init post fetch will scan for clients...
        // BTOpenGadget('pairing.html', 286, 130, { openposition: 'offset:(25;30)' });
    }



    jQuery('#computerselect').click( function(evt) {
        BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
    });


} );