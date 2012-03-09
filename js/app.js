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

        this.listen_key = config.conduit_toolbar_message_key;
/*
        if (this.get('type') == 'client') {
            this.listen_key = config.conduit_toolbar_message_key;
        } else {
v            this.listen_key = config.conduit_toolbar_message_key_slave;
        }
*/

        if (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i)) {
            // chrome gets all messages without even needing to
            // register. in fact, if you do register, you get
            // duplicate messages.

        } else {
            RegisterForMessaging(this.listen_key);
        }
        var _this = this;

        this.bind('reset', function() {
            // called when a client is removed!
            //clients.fetch();
        });

        if (window.EBGlobalKeyChanged) { myconsole.error('message received already defined!'); debugger; }
        window.EBGlobalKeyChanged = function(k,v) {
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

/*
  conduit says to use EBGlobalKeyChanged instead
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
*/
    },
    handle_message: function(k,msg) {

        if (msg.type == 'broadcast') {

            // simple solution for state issues. when client changes
            // (due to login or pairing accept or whatever, just
            // reload everything)
            if (msg.message == 'new client selection') {
                if (this.get('type') == 'client') {
                    //clients.reset();
                    clients.fetch();
                    var client = clients.get_by_id( msg.id );
                    assert(client);
                    if (window.clientview) {
                        window.clientview.destroy();
                    }
                    window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
                } else if (this.get('type') == 'torrent') {
                    window.location.reload();
                }
            } else if (msg.message == 'close floating windows') {
                CloseFloatingWindow();
            } else if (msg.message == 'no clients') {
                window.location.reload();

/*
                if (this.get('type') == 'client') {
                    if (window.clientview) {
                        window.clientview.destroy();
                        // this should be putting the parent container back but isnt... ?
                    }
                }
*/
            } else if (msg.message == 'pairing accepted') {
                window.location.reload();
            } else if (msg.message == 'remote login') {
                window.location.reload();
            }

            return;
        }

        if (msg.recipient && this.get('type') == msg.recipient) { // some messages are sent to specific windows
            if (msg.command == 'select_torrent') {
                // this logic is duplicated in the "torrent" frame script onready
                var client = clients.selected; 
                assert(client.collection);
                client.fetch(); // fetches updated "active_hash" attribute
            } else if (msg.command == 'reload') {
                window.location.reload();
            } else if (msg.command == 'pair') {
                var client = clients.get_by_id(msg.id);
                this.pair(client);
            } else if (msg.command == 'scan_clients') {
                clients.find_local_clients( function(clients) {
                });
            } else if (msg.command == 'update_client_status') {
                var client = clients.get_by_id(msg.id);
                client.fetch();
                /*
                  clients.each( function(client) {
                  client.fetch(); // update status attribute on client
                  });
                */
            } else if (msg.command == 'switch_client') {
                debugger;
            } else if (msg.command == 'custom_track') {
                console.log('sending custom track event', msg.data.name, msg.data.mydata);
                custom_track(msg.data.name, msg.data.mydata);
            }
            return;
        }

        if (msg.command == 'reset') {
            debugger;
            //clients.models = [];
            clients.reset();
            return;
        }

        // older message types (before broadcast & send_message)
        console.log('app',this.get('type'),'handling toolbarapi message',k,JSON.stringify(msg));
        if (this.get('type') == 'client') {
            
            if (msg.command == 'switch_client') {
                var prevclient = clients.selected;
                clients.fetch(); // should get new selected attribute
                clients.selected = clients.get_selected();
                assert( clients.selected.id == msg.id );
                clients.trigger('selected', clients.selected); // triggers recreation of view

            } else if (msg.command == 'add_by_url') {
                clients.selected.doreq( { action: 'add-url', s: msg.url } );
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
        } else if (this.get('type') == 'torrent') {
            if (msg.command == 'switch_client') {
                window.location.reload(); // this works better than duplicating the init logic in torrent.js
            }
        }
    },
    switch_to_client: function(client) {
        if (this.get('type') == 'client') {
            // mainly occurs after pairing found port
            window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
            this.send_message( { recipient: 'torrent', command: 'reload' } );
            // $('.computer_name').text( client.get_name() );
        } else {
            debugger;
            var data = client.attributes;
            //console.log('click switch to computer',data);
            var msg = { 'command': 'switch_client', 'id': client.id  };
            BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
        }
    },
    open_gadget: function(name) {
        var msg = { 'command': 'open_gadget', 'name': name };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    pair: function(client) {
        if (this.get('type') == 'client') {
            if (client.get('data').name != 'unknown') {
                // likely supports new style pairing
                BTOpenGadget('pairing.html', 286, 200, { openposition: 'offset:(0;30)' });
            } else {
                BTOpenGadget('pairing_instructions.html', 286, 200, { openposition: 'offset:(0;30)' });
                client.pair_jsonp();
            }
        } else {
            console.error('must pair from client frame');
        }
    },
    add_client: function(client) {
        var msg = { 'command': 'add_client', 'data': client.attributes };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    remove_client: function(client) {
        debugger;
        var msg = { 'command': 'remove_client', 'data': client.attributes };
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    send_reset: function() {
        // tell the main app to reset state..
        var msg = { 'command': 'reset' }
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    send_message: function(msg) {
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    },
    broadcast: function(msg) {
        // sends a message to all windows
        msg.type = 'broadcast';
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    }
    
});