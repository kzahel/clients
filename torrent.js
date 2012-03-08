jQuery(document).ready( function() {

    //ChangeWidth(config.torrent_pane_width);

    window.clients = new ClientCollection;
    
    window.app = new App( { type: 'torrent' } );

    clients.fetch(); // don't fetch! we will receive messages...
    clients.init_post_fetch();


    var client = clients.selected;
    if (client) {
        var torrent = client.get_selected_torrent();
        if (torrent) {
            window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent } );
        } else {
            $('#torrent_template_container').text('loading...');
            if (! client.updating) {
                client.bind('firstupdate', function(arg) {
                    var torrent = client.get_selected_torrent();
                    window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent } );
                });
                client.start_updating();
            }
        }

        client.bind('change:active_hash', function() {
            var torrent = client.get_selected_torrent();
            window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent } );
        });
    }

    jQuery('#torrent_list').click( function(evt) {
        BTOpenGadget('torrents.html', 400, 344, { openposition: 'offset:(0;30)' });
    });

    jQuery('#red_button').click( function(evt) {
        BTOpenGadget('add.html', 395, 118, { openposition: 'offset:(25;30)' });
    });


} );