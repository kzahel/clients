jQuery(document).ready( function() {
    //ChangeWidth(config.torrent_pane_width);
    window.clients = new ClientCollection;
    
    window.app = new App( { type: 'files' } );

    clients.fetch(); // don't fetch! we will receive messages...
    clients.init_post_fetch();

    var client = clients.selected;
    if (client) {

        var url_args = decode_url_arguments();
        var hash = url_args.hash;
        var sid = url_args.sid;
        var d = [ hash ];
        var torrent = new Torrent( { id: d[0], data: d } );
        torrent.set( {stream_id:sid} );
        var torrents = new TorrentCollection( [ torrent ], { client: client } );

        var files = torrent.get_files();

        window.filesview = new FilesView( { el: $('#global_container'), model: files } );
        files.fetch();


    }
} );