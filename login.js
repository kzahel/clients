jQuery(document).ready( function() {
    window.clients = new ClientCollection;
    clients.fetch();
    window.app = new App( { type: "login" } );

    jQuery('#button_login').click( function(evt) {

        var username = jQuery('#username').val();
        var password = jQuery('#password').val();

        var session = new falcon.session;
        session.negotiate( username, password, { 
            success: function(session) {
                debugger;
                var client = new Client( { type: 'remote', data: session.serialize() } );
                clients.add(client); // adds to local collection
                clients.set_active(client); // sets selected attribute, unsets on other clients
                //app.send_reset(); // triggers other apps to reset
                CloseFloatingWindow();
            },
            error: function(xhr, status, text) {
                $('.spinner').html(JSON.stringify(text));
            },
            progress: function(data) {
                $('.spinner').html(JSON.stringify(data));
            }
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