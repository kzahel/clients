jQuery( function() {

    window.clients = new ClientCollection;
    window.clientsview = new ClientsView( { el: $('#clients_view'), model: clients } );
    window.app = new App( { type: 'web' } );

    clients.fetch();
    clients.init_post_fetch();
    clients.set_selected();

    if (clients.selected) {
        var client = clients.selected;
        window.torrentsview = new TorrentsView( { el: $('#torrents_view'), model: client } );
        client.start_updating();
    }

    $('.add').click( function(evt) {
        var msg = { recipient: 'web', command: 'open_gadget', name: 'login' };
        app.send_message( msg );
    });


} );