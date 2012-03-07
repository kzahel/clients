/*

each conduit HTML frame gets an "app" instance, with a "type" attribute.

-----------------------------------------------------
| "client" app | "torrent" app           +^<        |
----------------------------------------------------
  |            |                           |
  |  "clients" |  "torrents" app           |
  |            |                           |
  ------------------------------------------

Pictured above, the main "client" app and "torrent" app, which give
"clients" and "torrents" dropdown apps.

"client" and "torrent" are Conduit "HTML Components", while all other
apps are Conduit floating "Gadget windows".

the "client" app is the "main" application. It is always active. The
"torrent" app is meant to be collapsable, and all the other apps open
and close with user actions.

These apps can talk to each other using Conduit "SendMessage". There
are some browser specific quirks to these messages (chrome does not
support "RegisterForMessaging" and simply receives all messages).

 */

var App = Backbone.Model.extend( {
    initialize: function(opts) {
        this.__name__ = 'App';

        if (this.get('type') == 'client') {
            this.listen_key = config.conduit_toolbar_message_key;
        } else {
            this.listen_key = config.conduit_toolbar_message_key_slave;
        }

        if (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i)) {
            // chrome gets all messages without even needing to
            // register. in fact, if you do register, you get
            // duplicate messages.

        } else {

            RegisterForMessaging(this.listen_key);
        }
        var _this = this;

        if (window.EBMessageReceived) { myconsole.error('message received already defined!'); debugger; }

        window.EBMessageReceived = function(k,v) {
            try {
                var data = JSON.parse(v);
            } catch(e) {
                console.error('error parsing gadget message',v);
                debugger;
            }
            if (_this.listen_key == k) {
                _this.handle_message(k,data);
            } else {
                //console.warn('ignoring message',k,'was listening for',_this.listen_key);
            }
        }
    },
    handle_message: function(k,msg) {
        console.log('app',this.get('type'),'handling toolbarapi message',k,msg);
        if (msg.command == 'switch_client') {
            var client = new Client( msg.data );
            clients.set_active(client);
        } else if (msg.command == 'add_client') {
            var client = new Client( msg.data );
            clients.add( client );
            clients.set_active(client);
        } else if (msg.command == 'remove_client') {
            var client = new Client( msg.data );
            debugger;
            clients.remove( client );

            clients.set_active(null);
        } else if (msg.command == 'open_gadget') {
            if (msg.name == 'login') {
                BTOpenGadget('login.html', 286, 200, { openposition: 'offset:(0;30)' });
            } else {
                console.error('unrecognized gadget');
                debugger;
            } 
        } else {
            console.error('unhandled message',msg);
        }
    },
    switch_to_client: function(client) {
        if (this.get('type') == 'client') { // MAIN APP
            $('.computer_name').text( client.get_name() );
        } else {
            var data = client.attributes;
            //console.log('click switch to computer',data);
            var msg = { 'command': 'switch_client', 'data': data };
            BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
        }
    },
    open_gadget: function(name) {
        var msg = { 'command': 'open_gadget', 'name': name };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    add_client: function(client) {
        var msg = { 'command': 'add_client', 'data': client.attributes };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    remove_client: function(client) {
        var msg = { 'command': 'remove_client', 'data': client.attributes };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    }

});