
jQuery(document).ready( function() {

    window.clients = new ClientCollection;
    window.clientsview = new ClientsView( { el: $('#clients_view'), model: clients } );
    window.app = new App( { type: 'clients' } );
    clients.fetch();

    console.log('clients',clients.models);

} );