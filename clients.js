
jQuery(document).ready( function() {

    window.clients = new ClientCollection;
    window.clientsview = new ClientsView( { el: $('#clients_view'), model: clients } );
    window.app = new App( { type: 'clients' } );
    clients.fetch();


    var local_clients_count = 0;
    clients.each( function(c) {
        if (c.get('type') == 'local') {
            local_clients_count += 1;
        }
    });

    if (local_clients_count == 0) {
        console.log('no local clients -- adding some');
        clients.find_local_clients(function(){});
    }

    console.log('clients',clients.models);

    $('.add').click( function(evt) {
        app.open_gadget('login');
    });


} );