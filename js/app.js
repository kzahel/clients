var App = Backbone.Model.extend( {
    initialize: function(opts) {

        console.log('init model with opts',opts);

        if (this.get('type') == 'client') {
            RegisterForMessaging(config.conduit_toolbar_message_key);
        } else {
            RegisterForMessaging(config.conduit_toolbar_message_key_slave);
        }

        var _this = this;

        window.EBMessageReceived = function(k,v) {
            console.log('app received toolbarapi message',k,v);
            try {
                var data = JSON.parse(v);
            } catch(e) {
                console.error('error parsing gadget message',v);
                debugger;
            }
            _this.handle_message(data);
        }



    },
    handle_message: function(msg) {
        debugger;
    },
    switch_to_client: function(client) {
        console.log('click switch to computer',id);
        var msg = { 'command': 'change_connection', 'id': id };
        SendMessage(config.conduit_toolbar_message_key_slave, JSON.stringify(msg) );
        evt.preventDefault();
    }

});