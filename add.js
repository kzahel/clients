jQuery(document).ready( function() {

    window.clients = new ClientCollection;

    clients.fetch();

    jQuery('#button_upload').click( function() {
        console.log('clicked upload button');
        var url = jQuery('#url_input').val();
        var msg = { 'command': 'add_by_url', 'url': url };
        SendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
        jQuery('#url_input').val('');
    });



} );