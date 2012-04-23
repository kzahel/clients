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

These apps can talk to each other using Conduit "SendMessage"*. There
are some browser specific quirks to these messages (chrome does not
support "RegisterForMessaging" and simply receives all messages).

* Update -- conduit advises against using SendMessage, so we use
EBGlobalKeyChanged/SetGlobalKey instead. This has issues with IE,
however. Only the first tab is receiving the EBGlobalKeyChanged event,
causing "torrents" app to not be able to tell "torrent" app that the
torrent selection has changed (it tells the first tab's "torrent" app
only)

 */

var App = Backbone.Model.extend( {
    initialize: function(opts) {
        assert(opts && opts.type);
        this.__name__ = 'App';
        this.settings = new Settings;
        this.listen_key = config.conduit_toolbar_message_key;
        var _this = this;

        this.bind('reset', function() {
            // called when a client is removed!
            //clients.fetch();
        });

        // local keys are sent only to the current gadget
        window.EBLocalKeyChanged = window.EBKeyChanged = function(k,v) {
            // why do we have to define both? weird...
            try {
                var data = JSON.parse(v);
            } catch(e) {
                console.error('error parsing gadget message',v);
                debugger;
            }
            if (_this.listen_key == k.slice( 0, _this.listen_key.length )) {
                // local messages append a seemingly random numeric string to the end
                _this.handle_message(k,data, {local:true});
            } else {
                //console.warn('ignoring message',k,'was listening for',_this.listen_key);
            }
        }
        // global keys are sent to every tab, every component
        if (window.EBGlobalKeyChanged) { console.error('already defined!'); debugger; }
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
    },
    send_state_dump: function() {
        if (clients.selected) {
            var data = clients.selected.serialize()
            var msg = {type:'broadcast', message:'state_dump', data:data};
            debugger;
            this.send_message(msg);
        }
    },
    handle_message: function(k, msg, opts) {
        var my_type = this.get('type');
        var local_message = false;
        if (opts && opts.local) {
            // experiments with "tab-only" messages exposed conduit
            // API problems which may or may not be fixed by now.
            local_message = true;
            console.log(this.get('type'),'receive local message',k,msg);
        }

        if (msg.type == 'broadcast') {
            // simple solution for state issues. when client changes
            // (due to login or pairing accept or whatever, just
            // reload everything)
            if (msg.message == 'new client selection') {
                if (my_type == 'client') {
                    return BTReload(this);
                    // XXX -- the following (which would be better)
                    // was not working... fetch() wasnt showing the
                    // new models.
                    clients.fetch();
                    var client = clients.get_by_id( msg.id );
                    assert(client);
                    if (window.clientview) {
                        window.clientview.destroy();
                    }
                    window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
                    client.check_status();
                } else if (my_type == 'torrent') {
                    BTReload(this);
                }
            } else if (msg.message == 'reset') {
                BTReload(this);
            } else if (msg.message == 'close floating windows') {
                CloseFloatingWindow();
            } else if (msg.message == 'no clients') {
                BTReload(this);
            } else if (msg.message == 'pairing accepted') {
                // set torrent view to expand
                this.settings.set('collapsed',false);
                this.settings.save();
                BTReload(this);
            } else if (msg.message == 'remote login') {
                BTReload(this);
            } else if (msg.message == 'switch_client') {
                if (my_type == 'client') {
                    var prevclient = clients.selected;
                    clients.fetch(); // should get new selected attribute
                    clients.selected = clients.get_selected();
                    assert( clients.selected.id == msg.id ); // IE used to trigger this assert but isn't anymore??
                    clients.trigger('selected', clients.selected); // triggers recreation of view
                } else if (my_type == 'torrent') {
                    BTReload(this);
                }

            }
            return;
        }

        if (msg.recipient) { // some messages are sent to specific windows
            if (this.get('type') == msg.recipient) {
                if (msg && msg.recipient_iid && msg.recipient_iid != this.get('iid')) {
                    return;
                }
                if (msg && msg.command == 'heartbeat') {
                } else {
                    console.log('app',this.get('type'),'handling toolbarapi message',k,JSON.stringify(msg));
                }
                if (msg.command == 'select_torrent') {
                    var client = clients.selected;
                    client.set('active_hash', msg.hash);
                    //assert(client.collection);
                    //client.fetch(); // fetches updated "active_hash" attribute // XXX local storage not updating across IE tabs???  ???
                    assert(client.get('active_hash') == msg.hash);
                } else if (msg.command == 'heartbeat') {
                    app.siblings.register_heartbeat(msg);
                } else if (msg.command == 'expand') {
                    app.expand();
                } else if (msg.command == 'collapse') {
                    app.collapse();
                } else if (msg.command == 'add_by_url') {
                    clients.selected.doreq( { action: 'add-url', s: msg.url } );
                } else if (msg.command == 'initialize') {
                    app.app_initialize(msg);
                } else if (msg.command == 'notify_status') {
                    app.notify_status({id:msg.id, status:msg.status});
                } else if (msg.command == 'setup_remote') {
                    BTOpenGadget('signup.html?id=' + msg.id, 286, 200, { openposition: 'offset:(0;30)' });
                } else if (msg.command == 'reload') {
                    BTReload(this);
                } else if (msg.command == 'pair') {
                    var client = clients.get_by_id(msg.id);
                    this.pair(client);
                } else if (msg.command == 'scan_clients') {
                    clients.find_local_clients( function(clients) {
                    });
                    /* the following are legacy messages ? */
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
                        var url = 'login.html';
                        if (msg.replace) {
                            // this login is intended to replace an existing session
                            url += '?replace=' + encodeURIComponent(msg.replace);
                        }
                        BTOpenGadget(url, 286, 200, { openposition: 'offset:(0;30)' });
                    } else {
                        console.error('unrecognized gadget');
                        debugger;
                    }
                } else if (msg.command == 'one_click_url') {
                    if(clients.selected) {
                        clients.selected.doreq( { action: 'add-url', s: msg.url } );
                    } else {
                        //open clients dialog
                        clientview.$el.click();
                    }
                } else if (msg.command == 'update_client_status') {
                    var client = clients.get_by_id(msg.id);
                    client.fetch(); // should update status attribute... unfortunately does not seem to be triggering change+draw
                    debugger;
                    /*
                      clients.each( function(client) {
                      client.fetch(); // update status attribute on client
                      });
                    */
                } else if (msg.command == 'custom_track') {
                    // don't do it this way. each IE tab will pick up the event
                    console.log('sending custom track event', msg.data.name, msg.data.mydata);
                    custom_track(msg.data.name, msg.data.mydata);
                }
            }
            return;
        }

        // older message types (before broadcast & send_message)
        console.log('app',this.get('type'),'legacy toolbarapi message',k,JSON.stringify(msg));
        debugger;
    },
    display_status: function(msg) {
    },
    switch_to_client: function(client) {
        // xxx -- should broadcast now?
        if (this.get('type') == 'client') {
            // mainly occurs after pairing found port
            window.clientview = new ClientView( { el: $('#computerselect'), model: client } );
            this.send_message( { recipient: 'torrent', command: 'reload' } );
            // $('.computer_name').text( client.get_name() );
        } else {
            // remove this cruft?
            debugger;
            var data = client.attributes;
            //console.log('click switch to computer',data);
            var msg = { 'command': 'switch_client', 'id': client.id  };
            BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
        }
    },
    open_gadget: function(name) {
        var msg = { recipient: 'client', command: 'open_gadget', name: name };
        this.send_message( msg );
    },
    pair: function(client) {
        if (true || this.get('type') == 'client') {
            if (client.get('data').name != 'unknown') {
                // likely supports new style pairing
                BTOpenGadget('pairing.html', 286, 155, { openposition: 'offset:(0;30)' });
            } else {
                BTOpenGadget('pairing_instructions.html', 286, 265, { openposition: 'offset:(0;30)' });
                client.pair_jsonp();
            }
        } else {
            console.error('must pair from client frame');
        }
    },
    add_client: function(client) {
        // is this necessary?
        var msg = { recipient: 'client', command: 'add_client', data: client.attributes };
        this.send_message( msg );
    },
    remove_client: function(client) {
        var msg = { recipient: 'client', command: 'remove_client', data: client.attributes };
        this.send_message( msg );
    },
    send_message: function(msg, opts) {
        if (opts && opts.local) {
            // there is no such thing as a "tab" only message.
            BTSendTabMessage(config.conduit_toolbar_message_key, JSON.stringify(msg), opts );
        } else {
            BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg), opts );
        }
    },
    broadcast: function(msg) {
        // sends a message to all windows
        msg.type = 'broadcast';
        BTSendMessage(config.conduit_toolbar_message_key, JSON.stringify(msg) );
    }
    
});