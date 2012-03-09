jQuery(document).ready( function() {
    window.clients = new ClientCollection;
    clients.fetch();
    window.app = new App( { type: "login" } );

    jQuery('#button_login').click( function(evt) {

        var username = jQuery('#username').val();
        var password = jQuery('#password').val();

        var session = new falcon.session;
        custom_track('login_attempt');
        session.negotiate( username, password, { 
            success: function(session) {
                var client = new Client( { type: 'remote', data: session.serialize() } );
                custom_track('login_success');
                clients.add(client); // adds to local collection
                clients.set_active(client); // sets selected attribute, unsets on other clients
                // app.switch_to_client(client);
                app.broadcast( { message: 'remote login', id: client.id } );
                //app.send_message( { command: 'switch_client', id: client.id } );
                //app.send_reset(); // triggers other apps to reset
                BTCloseFloatingWindow();
            },
            error: function(xhr, status, text) {
                custom_track('login_error');
                custom_track('login_error.' + text.error);
                $('.spinner').html(JSON.stringify(text));
            },
            progress: function(data) {
                if (data.progress) {
                    var w = data.progress * 100 + '%'
                    console.log('set progress width',w);
                    $('.progressbar_fill').css('width', w);
                } else if (data.message) {
                    $('.spinner').html(data.message);
                }
            },
            timeout: 3000,
        });

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