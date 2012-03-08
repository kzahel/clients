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
            $('#torrent_template_container').text('Loading view...');
            if (! client.updating) {
                client.bind('firstupdate', function(arg) {
                    var torrent = client.get_selected_torrent();
                    window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent } );
                });
                client.start_updating();
            }
        }

        
        // this client object is dead after a clients.fetch(). we did clients.fetch to get updated active_hash.
        // perhaps it would be better to store active_hash on the torrentcollection, but that way it would not be persisted... :-(

        client.bind('change:active_hash', function() {
            if (window.torrentview) {
                torrentview.model.unbind(); // ? want to only unbind our method..
                var parent = torrentview.el.parentNode;
                //torrentview.remove(); // this is removing the container the view attached to :-(
                window.torrentview.destroy(); //not working correctly??
                $(parent).append( $('<div id="torrent_template_container"></div>') );
            }
            var torrent = client.get_selected_torrent();
            window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent } );
        });


        client.bind('remove_torrent', function(torrent) {
            if (window.torrentview) {
                if (torrentview.model.id == torrent.id) {
                    var torrent = client.get_selected_torrent();
                    if (torrent) {
                        client.set('active_hash', torrent.get('hash'));
                    } else {
                        client.set('active_hash', null);
                    }
                    // removed current selected torrent ... need to change
                    
                }
            }
        });

    }

    jQuery('#torrent_list').click( function(evt) {
        BTOpenGadget('torrents.html', 400, 344, { openposition: 'offset:(0;30)' });
    });

    jQuery('#red_button').click( function(evt) {
        BTOpenGadget('add.html', 395, 118, { openposition: 'offset:(25;30)' });
    });


} );