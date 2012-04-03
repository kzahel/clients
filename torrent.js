jQuery(document).ready( function() {
    window.clients = new ClientCollection;
    clients.fetch(); // don't fetch! we will receive messages...

    window.app = new App( { type: 'torrent' } );
    // this entire window is reloaded every time a client switch is initaited, to simplyfy the code

    //ChangeWidth(config.torrent_pane_width);

    function show_setup(client, message) {
        $('#torrent_controls').hide();
	$('.default_container').text(message?message:'Click to setup control'); // insert iframe here instead?
        $('.default_container').unbind();
        $('.default_container').click( function() {
            // XXX this sends the message to every TAB!!!
            app.send_message( { recipient: 'client', command: 'pair', id: client.id }, {local:true} );
        });
    }

    function show_remote_setup(client, message) {
        $('#torrent_controls').hide();
	$('.default_container').text(message?message:'Click to login'); // insert iframe here instead?
        $('.default_container').unbind();
        $('.default_container').click( function() {
            // XXX this sends the message to every TAB!!!
            app.send_message( { command: 'open_gadget', name: 'login', replace: client.get('data').guid } );
            // send to client only
        });
    }


    jQuery('.arrow_collapse').live('click', function(evt) {
        //app.collapse();
        app.send_message( { recipient: 'torrent', command: 'collapse' } );
    });

    jQuery('.arrow_expand').live('click', function(evt) {
        //app.expand();
        app.send_message( { recipient: 'torrent', command: 'expand' } );
    });

    app.expand = function() {
        app.settings.set('collapsed',false);
        app.settings.save();

        var el = $('#accordion');
        el.addClass('arrow_collapse');
        el.removeClass('arrow_expand');
        ChangeWidth(config.torrent_pane_width);
        if (clients.selected) {
            clients.selected.start_updating()
        }
        $('.torrent_wrapper').show();
    }

    app.collapse = function() {
        app.settings.set('collapsed',true);
        app.settings.save();

        var el = $('#accordion');
        el.addClass('arrow_expand');
        el.removeClass('arrow_collapse');
        ChangeWidth(config.torrent_pane_collapsed_width);
        if (clients.selected) {
            clients.selected.stop_updating();
        }
        $('.torrent_wrapper').hide();
    }

    app.display_status = function(status) {
	$('.default_container').text(status);
    }

    app.notify_status = function(opts) {
        var client = clients.get_by_id( opts.id );
        var status = opts.status;
        if (client.get('type') == 'local') {
            if (status == 'unauthorized') {
                show_setup(client, 'Key invalid. Click to authorize');
            } else if (status == 'no pairing key') {
                show_setup(client);
            } else {
	        $('.default_container').text('Status: '+status);
            }
        } else {
            if (status == 'unauthorized guid') {
                show_remote_setup(client, 'GUID invalid. Click to correct');
            } else {
	        $('.default_container').text('Status: '+status);
            }

        }
    };

    app.initialize = function() {

        if (app.settings.get('collapsed')) {
            app.collapse();
        }

        clients.init_post_fetch();

        var client = clients.selected;
        if (! client) {
            debugger;
        }
        if (client) {

            if (client.get('type') == 'local' && ! client.get('data').key) {
                show_setup(client);
                return;
            }

            var torrent = client.get_selected_torrent();
            if (torrent) {
                window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent, client: client } );
            } else {
                // $('#torrent_template_container').text('Loading view...');
                if (! client.updating) {
                    client.bind('firstupdate', function(arg) {
                        var torrent = client.get_selected_torrent();
                        if (true || torrent) {
                            // TODO -- dont use torrentview with no model..?
                            window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent, client: client } );
                        } else {
                            // create a view specifically for "no torrent"
                            $('.default_container').html('No Torrents');
                            // listen for "add torrent"
                            client.torrents.bind('add', function() {
                                debugger;
                            });
                        }
                    });
                    app.display_status('Fetching data...');
                    client.start_updating();
                }
            }

            // this client object is dead after a clients.fetch(). we did clients.fetch to get updated active_hash.
            // perhaps it would be better to store active_hash on the torrentcollection, but that way it would not be persisted... :-(

            client.bind('change:active_hash', function() {
                if (window.torrentview) {
                    if (torrentview.model) {
                        torrentview.model.unbind(); // ? want to only unbind our method..
                    }

                    var parent = torrentview.el.parentNode;
                    //torrentview.remove(); // this is removing the container the view attached to :-(
                    window.torrentview.destroy(); //not working correctly??
                    $(parent).append( $('<div id="torrent_template_container"></div>') );
                }
                var torrent = client.get_selected_torrent();
                window.torrentview = new ActiveTorrentView( { el: $('#torrent_template_container'), model: torrent, client: client } );
            });


            client.bind('remove_torrent', function(torrent) {
                // XXX -- this should be cleaned up.
                if (window.torrentview) {
                    if (torrentview.model) {
                        if (torrentview.model.id == torrent.id) {
                            var torrent = client.get_selected_torrent();
                            if (torrent) {
                                client.set('active_hash', torrent.get('hash'));
                            } else {
                                client.set('active_hash', null);
                            }
                            // removed current selected torrent ... need to change
                        } else {
                            // the removed torrent was not the one currently displayed... so do nothing
                        }
                    } else {
                        // no more torrents remain!
                        client.set('active_hash', null);
                    }
                }
            });

        }


        jQuery('#torrent_list').click( function(evt) {
            BTOpenGadget('torrents.html', 400, 344, { openposition: 'offset:(0;30)' });
        });

        jQuery('#red_button').click( function(evt) {
            BTOpenGadget('add.html', 395, 150, { openposition: 'offset:(25;30)' });
        });

    }

} );