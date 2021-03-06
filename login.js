jQuery(document).ready( function() {

    $('#login_view').html( $('#login_template').html() );


    window.clients = new ClientCollection;
    window.app = new App( { type: "login" } );

    clients.fetch();
    clients.init_post_fetch(); // sets selected
    
    var url_args = decode_url_arguments();
    var guid = url_args.replace;

    if (guid) {
        var old_client = clients.get_by_guid(guid);
        if (old_client) {
            jQuery('#username').val( old_client.get('data').bt_user );
        }
    }

    var logging_in = false;
    function do_login(evt) {
        if (logging_in) { return; }
        logging_in = true;
        var username = jQuery('#username').val();
        var password = jQuery('#password').val();

        var session = new falcon.session;
        custom_track('login_attempt');
        session.negotiate( username, password, { 
            success: function(session) {
                var client = new Client( { type: 'remote', data: session.serialize() } );
                custom_track('login_success');

                if (url_args.replace) {
                    // this login is intended to replace a broken login
                    var guid = url_args.replace;
                    var old_client = clients.get_by_guid(guid);

                    // clients.remove(old_client);
                    // does this call sync? i don't think so
                    old_client.destroy(); // this probably does the right thing though
                }

                clients.add(client); // adds to local collection
                clients.set_active(client); // sets selected attribute, unsets on other clients
                app.broadcast( { message: 'remote login', id: client.id } );
                BTCloseFloatingWindow(); 
            },
            error: function(xhr, status, text) {
                logging_in = false;
                custom_track('login_error');
                custom_track('login_error.' + text.error);
                $('.spinner').html(JSON.stringify(text));
            },
            progress: function(data) {
                if (data.progress) {
                    var w = data.progress * 100 + '%'
                    //console.log('set progress width',w);
                    $('.progressbar_fill').css('width', w);
                } else if (data.message) {
                    $('.spinner').html(data.message);
                }
            },
            timeout: 5000, // in case offline, need falcon-api to support timeout better...
        });
    }

    jQuery('#button_login').click( do_login );

    jQuery('#password').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_login(evt);
        }
    });
    jQuery('#username').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_login(evt);
        }
    });


    jQuery('#button_scan').click( function(evt) {
        app.send_message( { recipient: 'client', command: 'scan_clients' } );
        /* let the main frame do the scan
           clients.find_local_clients( function(clients) {
           //console.log('found clients',clients);
           });
           CloseFloatingWindow();
        */
    });


} );