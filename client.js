jQuery(document).ready( function() {

    //ChangeWidth(config.client_pane_width);

    window.app = new App( { type: 'client' } );
    window.clients = new ClientCollection;

    clients.fetch(); 
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {
        var data = client.get('data');
        if (! data.key) {
            client.pair();
        }
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
        jQuery('#computerselect').click( function(evt) {
            BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
        });

    }


    clients.bind('selected', function(client) {
        if (window.clientview) {
            if (clientview.model.id == client.id) {
                return;
            } else {
                clientview.destroy()
            }
        }

        // should subclass clientview, activeclientview...
        window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
        jQuery('#computerselect').click( function(evt) {
            BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
        });

    });


/*
    clients.bind('destroy', function(client) {
        debugger;
        window.clientview = new ClientView( { el: $('#computerselect'), model: null } );
    });
*/



} );