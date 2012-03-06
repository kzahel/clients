jQuery(document).ready( function() {

    ChangeWidth(config.client_pane_width);

    window.app = new App( { type: 'main' } );
    window.clients = new ClientCollection;

    clients.fetch();

    if (clients.models.length == 0) {
        debugger;
        BTOpenGadget('pairing.html', 286, 130, { openposition: 'offset:(25;30)' });
    }

    jQuery('#computerselect').click( function(evt) {
        BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
    });


} );