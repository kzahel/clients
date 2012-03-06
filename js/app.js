var App = Backbone.Model.extend( {
    initialize: function(opts) {
        console.log('init model with opts',opts);
        debugger;
        RegisterForMessaging(config.conduit_toolbar_message_key);

        window.EBMessageReceived = function(k,v) {
            console.log('app received toolbarapi message',k,v);
            try {
                var data = JSON.parse(v);
            } catch(e) {
                console.error('error parsing gadget message',v);
                debugger;
            }

            debugger;
        }



    },
    switch_to_client: function(client) {
        console.log('click switch to computer',id);
        var msg = { 'command': 'change_connection', 'id': id };
        SendMessage(config.conduit_toolbar_message_key_slave, JSON.stringify(msg) );
        evt.preventDefault();
    }

});