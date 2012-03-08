
var Client = Backbone.Model.extend({
    initialize: function(data) {
        this.__name__ = 'Client';
        this.data = data;

        this.cacheid = null;
        this.updates = 0;
        this.updating = false;
        this.torrents = new TorrentCollection( [], { client: this } );
        this.torrents.client = this;
        if (this.get('type') == 'remote') {
            this.api = new falcon.session( { client_data: this.data.data } );
        }
        var _this = this;
        this.bind('raptor_update', function() {
            debugger;
        });

        this.bind('view_active', function(view) {
            console.log('view made active... start basic status updating');
            _this.update_status();
            debugger;
        });

        this.paired_scan_interval = 20000;
        //this.update_interval = 4000;
        this.remote_update_interval = 4000;

        _.bindAll(this);
        // sort by date added...
    },
    get_selected_torrent: function() {
        if (this.torrents.models.length > 0) {
            var hash = this.get('active_hash');
            if (hash) {
                console.log('get selected torrent, hash',hash);
                var torrent = this.torrents.get( hash );
                if (torrent) {
                    console.log('got torrent',torrent.get('name'));
                    return torrent;
                }
            }
            return this.torrents.models[0];
        } else {
            console.error('get selected torrent -- no torrent models fetched');
        }
    },
    remove: function() {
        this.destroy();
        app.trigger('reset'); // model was destroyed from collection. tell other frames to reset
    },
    select: function() {
        this.collection.set_active(this);
        //this.trigger('selected', this); // to tell the collection a new selection is enabled
    },
    fetch_server: function() {
        // fetches "raptor" from database
        var _this = this;

        jQuery.ajax({
            url: config.srp_root + '/talon/getrapton?bt_talon_tkt=' + encodeURIComponent(this.get('data').bt_talon_tkt),
            dataType: 'jsonp',
            success: function(data) {
                var d = _this.get('data');
                if (d.host != data.rapton) {
                    console.warn('raptor changed address',d.host,'->',data.rapton);
                    d.host = data.rapton;
                    _this.set('data',d);
                    _this.save(); // update the model
                    _this.trigger('raptor_update');
                } else {
                    console.log(d.bt_user,'still offline', data.rapton);
                }

                //this.get('data')
                //if data.rapton == 
            },
            error: function(xhr, status, text) {
                debugger;
            }
        });
    },
    ready: function() {
        if (this.get('data').type == 'local') {
            if (this.get('data').key) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    },
    on_pair_response: function(jqevt) {
        var evt = jqevt.originalEvent;

        console.log('postmessage on window',evt.origin, evt.data);
        if (evt.data.key) {
            var d = this.get('data');
            d.key = evt.data.key;
            d.type = 'local';
            this.set('data', d);
            clients.add(this);
            this.save();
            this.start_updating();
        } else {
            console.error('pairing DEnied');
        }
        $('#pairing_view').html('');
        jQuery(window).off('message',this.on_pair_response);
    },
    pair: function() {
        // XXX -- needs to pop up in a gadget window :-(

        var _this = this;
        var url = 'http://127.0.0.1:' + this.get('data').port + '/gui/pair?iframe=' + encodeURIComponent(window.location.href);

        if (window.OpenGadget) {
            app.pair(this);
            //BTOpenGadget('pairing');
        } else {

        //$('#pairing_view').html('<div style="position: absolute; top:80px; left:80px"><iframe style="overflow:hidden; width:400px; height:200px;" id="pairing_frame" src="' + url + '"></iframe></div>'); // not working in IE...


            var iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.setAttribute('style','width:300px; height:250px; border: 0px; overflow:hidden;');
            iframe.id="pairing_frame";
            //var iframe = $('#pairing_frame')[0];
            document.getElementById('pairing_view').appendChild(iframe);
            
            //window.addEventListener('message', this.on_pair_response, false);
            jQuery(window).on('message', this.on_pair_response);
        }
    },
    invalidate_session: function() {
        if (this.get('data').type == 'local') {
            console.error('local pairing key expired/invalid');
            this.destroy();
        } else {
            console.error('remote session expired');
            this.destroy();
        }
    },
    get_name: function() {
        if (this.get('type') == 'local') {
            return escape(this.get('data').name)+ ' (local)';
        } else {
            return escape(this.get('data').bt_user)+ ' (remote)';
        }
    },
    start_updating: function() {
        if (this.updating) { return; }
        this.updating = true;
        this.do_update();
    },
    stop_updating: function() {
        this.updating = false;
        if (this.update_timeout) {
            clearTimeout( this.update_timeout );
        }
    },
    do_update: function() {
        var _this = this;

        if (this.updating) {
            if (this.get('type') == 'local' && this.get('data').key) {
                jQuery.ajax({
                    url: 'http://127.0.0.1:' + this.get('data').port + '/gui/?list=1&cid=' + this.cacheid + '&pairing=' + this.get('data').key + '&token=' + this.get('data').key, // send token as the pairing key to save a roundtrip fetching the token
                    dataType: 'jsonp',
                    success: function(data) {
                        if (data == 'invalid request') {
                            // token not valid
                            _this.invalidate_session();
                        } else {
                            _this.on_update(data);
                        }
                    },
                    timeout: 4000,
                    error: function(xhr, status, text) {
                        console.log('paired client update failure',status,text);
                        _this.set_status('not running');
                        if (_this.updates == 0) {
                            console.error('never got an update from ut -- ut is not running. maybe pop up dialog asking to run...');
                        }
                    }
                });
            } else if (this.api) {
                this.api.request( '/gui/',
                                  {list:1, cid:this.cacheid},
                                  {},
                                  _.bind(this.on_update, this),
                                  function(xhr, status, text) {
                                      if (text && text.error && text.error.code == 401) {
                                          _this.invalidate_session();
                                      } else if (text && text.error == 'client timeout') {
                                          _this.set_status('unavailable');

                                          // was able to contact server, but request to client timed out.
                                          _this.fetch_server();
                                          _this.update_timeout = setTimeout( _this.do_update, _this.remote_update_interval * 2 );
                                          debugger;
                                      } else if (status == 'timeout') {
                                          _this.set_status('unavailable');
                                          // buggy server (or possibly lost internet connection)
                                          _this.update_timeout = setTimeout( _this.do_update, _this.remote_update_interval * 10 );
                                          debugger;
                                      } else {
                                          debugger;
                                      }
                                  }
                                );
            }
        }
    },
    doreq: function(params) {
        var client = this;
        if (client.get('type') == 'local') {
            var parts = [];
            for (var key in params) {
                parts.push( key + '=' + encodeURIComponent(params[key]) );
            }
            jQuery.ajax({
                url: 'http://127.0.0.1:' + client.get('data').port + '/gui/?' + parts.join('&') + '&pairing=' + client.get('data').key + '&token=' + client.get('data').key, // send token as the pairing key to save a roundtrip fetching the token,
                dataType: 'jsonp',
                success: function(data, status, xhr) {
                    if (data == 'invalid request') {
                        debugger;
                    }
                    console.log('doreq success', params,data);
                },
                error: function(xhr, status, text) {
                    console.log('doreq error', text, params);
                }
            });
        } else {
            client.api.request('/gui/',
                              {},
                              params,
                              function(data, status, xhr) {
                                  console.log('doreq success', params, data);
                              },
                              function(xhr, status, text) {
                                  console.log('doreq error', text, params);
                              });
        }
    },
    on_update: function(data) {
        this.set_status('available');
        this.updates += 1;
        var changed = data.torrentp;
        var removed = data.torrentm;
        var added = data.torrents;
        this.cacheid = data.torrentc;
        
        if (removed) {
            _.map(removed, this.remove_torrent);
        }

        if (changed) {
            _.map(changed, this.change_torrent);
        }

        if (added) {
            _.map(added, this.change_torrent);
        }

        if (! this.get('active_hash')) {
            if (this.torrents.models.length > 0) {
                this.set('active_hash', this.torrents.get('hash'));
            }
        }

        this.trigger('update');
        if (this.updates == 1) {
            this.trigger('firstupdate');
        }
        this.update_timeout = setTimeout( this.do_update, this.remote_update_interval );
    },
    add_torrent: function(d) {
        var torrent = new Torrent( { id: d[0], data: d } );
        this.trigger('add_torrent', torrent);
        if (this.cacheid) {
            // allow new torrents to be inserted in-order in an existing list (updates only)
            this.trigger('new_torrent', torrent);
        }
        // if cacheid is outdated, adding here makes no sense...
        this.torrents.add(torrent);
    },
    change_torrent: function(d) {
        var torrent = this.torrents.get(d[0]);
        if (torrent) {
            this.trigger('change_torrent', torrent);
            torrent.update(d);
        } else {
            //debugger;
            this.add_torrent(d);
        }
    },
    remove_torrent: function(hash) {
        var torrent = this.torrents.get(hash);
        this.torrents.remove(torrent);
        this.trigger('remove_torrent', torrent);
    },
    set_status: function(status) {
        // when computer availability changes, update the attribute and tell the clients view that it should fetch...
        var oldstatus = this.get('status');
        if (oldstatus != status) {        
            this.set('status',status);
            this.save();
            app.send_message( { recipient: 'clients', command: 'update_client_status', id: this.id } );
        }
    },
    update_status: function() {
        // scans the client for online/offline status
        // a lightweight version of a full "update"
        var _this = this;
        if (this.get('type') == 'local') {
            jQuery.ajax({
                url: 'http://127.0.0.1:' + this.get('data').port + '/gui/foobar',
                dataType: 'jsonp',
                success: function(data) {
                    if (data == 'invalid request') {
                        _this.set_status('status','available');
                    } else {
                        debugger;
                        _this.set_status('status','?');
                    }
                    if (_this.updating) {
                        _this.timeout = setTimeout( _.bind(_this.update, _this), _this.paired_scan_interval );
                    }
                },
                error: function(xhr, status, text) {
                    debugger;
                    _this.set_status('status','off');
                }
            });
        } else {
            _this.api.request( 
                '/gui/',
                {getmsg:1},
                {},
                function(data) {
                    if (data.build) {
                        _this.set_status('on');

                        if (_this.updating) {
                            _this.timeout = setTimeout( _.bind(_this.update, _this), _this.remote_update_interval );
                        }
                    } else {
                        _this.set_status('off');
                    }
                },
                function(xhr, status, text) {
                    _this.set_status('off');
                    if (text && text.error) {
                        if (text.code == 401) {
                            _this.invalidate_session();
                        } else if (text.error == 'client timeout') {
                            _this.trigger('timeout');
                            // perhaps client changed to a different server
                            // xxx -- every timeout causes database lookup.
                            // do exponential backoff on fetch server
                            _this.fetch_server();
                            _this.timeout = setTimeout( _.bind(_this.update, _this), _this.remote_update_interval );
                        } else {
                            console.error(text, text.error);
                            debugger;
                        }
                    } else if (status == 'timeout') {
                        // toolbar/browser lost internet connectivity
                        _this.set_status('check connection');
                        _this.timeout = setTimeout( _.bind(_this.update, _this), _this.remote_update_interval );
                    } else {
                        debugger;
                    }
                }
            );
        }
        //console.log('update',this);
    }

});

var ClientCollection = Backbone.Collection.extend( {
    localStorage: new Store('ClientCollection'),
    model: Client,
    initialize: function() {
        this.__name__ = 'ClientCollection';

        var _this = this;

/* // want to manually call set_active instead of simply writing a selected attribute
        this.bind('selected', function(client) { 
            _this.set_active(client);
        });
*/

        this.bind('add', function(client) {
            if (! _this.selected) {
                client.select();
            }
        });
    },
    stop_all: function() {
        for (var i=0; i<this.models.length;i++) {
            this.models[i].stop_updating();
        }
    },
    get_by_id: function(id) {
        for (var i=0; i<this.models.length;i++) {
            if (this.models[i].id == id) {
                return this.models[i];
            }
        }
    },
    set_active: function(client, opts) {
        // backbone does not support .set() on collections :-( so we
        // set selected attribute on a model (which gets persisted)
        // and then simply assign our own selected attribute.
        var found = false;
        for (var i=0; i<this.models.length;i++) {
            if (this.models[i].id == client.id) {
                found = this.models[i];
                found.set('selected',true);
                found.save();
            }
            if (this.models[i].get('selected') && this.models[i] != client) {
                this.models[i].set({'selected':false}, {silent:true}); // unselect everybody else
                this.models[i].save();
            }
        }
        this.selected = found;
        if (opts && opts.silent) {
        } else {
            console.log('app',app.get('type'),'sending switch to client message');
            app.switch_to_client(found);
        }
    },
    get_selected: function() {
        for (var i=0; i<this.models.length; i++) {
            if (this.models[i].get('selected')) {
                return this.models[i];
            }
        }
    },
    init_post_fetch: function() {
        if (this.models.length == 0) {
            this.find_local_clients( function(clients) {
                //console.log('found clients',clients);
            });
        } else {
            // set selected client if one has selected attribute
            var selected = this.get_selected();
            if (selected) {
                this.selected = selected;
                if (window.app) {
                    console.log(app.get('type'),'restored selected client',this.selected);
                }
            } else {
                console.log('init post fetch -- no client had selected attribute');
            }
        }
    },
    find_local_clients: function(callback) {
        var pairing = new Pairing();
        var _this = this;
        pairing.bind('pairing:found', function(opts) {
            opts.attempt_authorization = false;
            var client = new Client( { type: 'local', data: opts } );
            client.pair();
            
            _this.add( client );

            if (_this.models.length == 1) {
                // first client found..
                _this.set_active(client);
            }

        });
        function alldone(data) {
            if (callback) {
                callback(clients);
            }
        }
        pairing.bind('pairing:nonefound', alldone);
        pairing.bind('pairing:done', alldone);
        pairing.scan();
    }

} );
