jQuery( function() {


    window.clients = new ClientCollection;
    window.clientsview = new ClientsView( { el: $('#clients_container'), model: clients } );

    window.activetorrentview = new ActiveTorrentView( { el: $('#active_torrent_view') } );
    window.torrentsview = new TorrentsView( { el: $('#torrents_view') } );

    clients.fetch();
    clients.init_post_fetch();

} );