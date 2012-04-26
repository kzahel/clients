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
            this.api = new falcon.session( { client_data: this.data.data  } );
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
        this.paired_update_interval = 4000;
        this.remote_update_interval = 4000;
        this.server_fetch_count = 0; // for exponential backoff on remote server fetch

        _.bindAll(this);
        // sort by date added...
    },
    running: function() {
        // actually means "clicking on client view should trigger pairing key dialog, if no pairing key yet"
        assert( this.get('type') == 'local');
        return !( this.get('status') == 'not running' ||
                  this.get('status') == 'not responding' ||
                  this.get('status') == 'pairing denied'
                );
    },
    set_selected_torrent: function(t) {
        this.set('active_hash', t.get('hash'));
        assert( this.get_selected_torrent() );
        this.save();
    },
    get_selected_torrent: function() {
        if (this.torrents.models.length > 0) {
            var hash = this.get('active_hash');
            if (! hash) {
                var t = this.torrents.models[0];
                hash = t.get('hash');
                this.set('active_hash', hash);
                this.save();
            }
            var torrent = this.torrents.get( hash );
            if (torrent) {
                return torrent;
            }
        } else if (this.updates == 0) {
            console.error('get selected torrent -- no torrent models fetched');
        } else {
            console.log('get selected torrent -- no torrents in client!');
        }
    },
    remove: function() {
        //app.trigger('reset'); // model was destroyed from collection. tell other frames to reset
        var collection = this.collection
        var selected = this.get('selected');
        this.destroy();

        if (selected) {
            console.log('remove client that was selected -- special case');
            if (collection.models.length > 0) {
                // select a random model...
                collection.models[0].select();
            } else {
                console.error('no clients left! broadcast no clients');
                app.broadcast( { message: 'no clients' } );
                // BTCloseFloatingWindow(); // redundant
            }
        }

    },
    select: function() {
        this.collection.set_active(this);
        app.broadcast( { message: 'new client selection', id: this.id } ); // sends messages to other windows
    },
    fetch_server: function(callback) {
        // fetches "raptor" from database
        var _this = this;

        jQuery.ajax({
            url: config.srp_root + '/talon/getrapton?bt_talon_tkt=' + encodeURIComponent(this.get('data').bt_talon_tkt),
            dataType: 'jsonp',
            success: function(data) {
                var d = _this.get('data');
                if (data.rapton && d.host != data.rapton) {
                    console.warn('raptor changed address',d.host,'->',data.rapton);
                    d.host = data.rapton;
                    _this.set('data',d);
                    _this.save(); // update the model
                    _this.trigger('raptor_update');
                    _this.server_fetch_count = 0;
                    if (callback) { callback({changed:true}); }
                    return;
                } else if (data && data.error && data.error.code == '/no/user') {
                    // user changed credentials
                    _this.invalidate_session();
                } else {
                    _this.server_fetch_count += 1;
                    console.log(d.bt_user,'still offline', data.rapton);
                }
                if (callback) { callback({changed:false}); }
            },
            error: function(xhr, status, text) {
                debugger;
                if (callback) { callback({error:true}); }
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
    got_key: function(key) {
        var d = this.get('data');
        d.key = key;
        d.type = 'local';
        this.set('data', d);
        this.save();
        this.collection.set_active(this);
    },
    pair_jsonp: function() {
        var url = 'http://127.0.0.1:' + this.get('data').port + '/gui/pair&name=' + encodeURIComponent('Control');
        var _this = this;
        jQuery.ajax( { url: url,
                       success: function(data) {
                           var key = data;
                           _this.got_key(key);
                           app.broadcast( { message: 'pairing accepted', id: _this.id } );
                           //app.broadcast( { message: 'close floating windows' } );
                       },
                       dataType: 'jsonp',
                       error: function(xhr, status, text) {
                           _this.set_status('pairing denied');
                           _this.save();
                           
                           app.broadcast( { message: 'pairing denied', id: _this.id } );
                           // likely a 401 unauthorized
                           // XXX -- handle allow login to remote
                       }
                     }
                   );
    },
    pair: function() {
        app.pair(this);
    },
    invalidate_session: function() {
        debugger;
        this.set_status('invalid');
        return; // never automatically destroy the model
        if (this.get('data').type == 'local') {
            console.error('local pairing key expired/invalid');
            debugger; // not correctly resetting state
            this.destroy();
        } else {
            console.error('remote session expired');
            this.destroy();
        }
    },
    get_name: function() {
        if (this.get('type') == 'local') {
            if (this.get('remote_username')) {
                return escape(this.get('remote_username'));
            } else {
                return escape(this.get('data').name);
            }
        } else {
            return escape(this.get('data').bt_user);
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
                        if (status == 'parsererror') {
                            // client probably just said "400 bad request"
                            console.error('jsonp error parsing response');
                            debugger;
                            _this.invalidate_session();
                        } else if (_this.updates == 0) {
                            console.error('never got an update from ut!');
                            debugger;
                            _this.invalidate_session();
                        }
                    }
                });
            } else if (this.api) {
                assert( this.get('data').host );
                this.api.request( '/gui/',
                                  {list:1, cid:this.cacheid},
                                  {},
                                  _.bind(this.on_update, this),
                                  function(xhr, status, text) {
                                      if (text && text.error && (text.code == 401 || text.error.code == 401)) {
                                          _this.invalidate_session();
                                          _this.set_status('invalid session');
                                      } else if (text && text.error == 'client timeout') {
                                          // XXX -- move this code into falcon javascript api ?
                                          _this.set_status('unavailable');
                                          // was able to contact server, but request to client timed out.
                                          var mult = 2 * Math.pow(2, _this.server_fetch_count);
                                          // TODO -- exponential backoff on fetch server
                                          var fetchin = _this.remote_update_interval * mult;
                                          console.log('next server fetch at', fetchin);
                                          _this.fetch_server();
                                          _this.update_timeout = setTimeout( _this.do_update, fetchin );
                                      } else if (status == 'timeout') {
                                          _this.set_status('unavailable');
                                          // buggy server (or possibly lost internet connection)
                                          _this.update_timeout = setTimeout( _this.do_update, _this.remote_update_interval * 2 );
                                          debugger;
                                      } else if (text && text.error == 'invalid JSON') {
                                          // client bug, sometimes it sends bad data
                                          _this.set_status('received bad data');
                                          _this.update_timeout = setTimeout( _this.do_update, _this.remote_update_interval * 2 ); // simply try again
                                          debugger;
                                      } else {
                                          debugger;
                                      }
                                  },
                                  { timeout: config.timeout_remote }
                                );
            }
        }
    },
    check_version: function( cb ) {
        // updates version for local client
        assert( this.get('type') == 'local');
        var _this = this;
        var url = 'http://127.0.0.1:' + this.get('data').port + '/version/';
        jQuery.ajax( { url: url,
                       dataType: 'jsonp',
                       timeout: 500,
                       success: function(data, status, xhr) {
                           cb();
                       },
                       error: function(xhr, status, text) {
                           _this.set_status('unavailable');
                           _this.save();
                           cb();
                       }
                     });
    },
    set_settings: function( d, success, error ) {
        var qs = 'action=setsetting';
        for (var k in d) {
            qs += ('&s=' + encodeURIComponent(k) + '&v=' + encodeURIComponent(d[k]));
        }
        this.doreq( qs, 
                    function(data, status, xhr) {
                        if (data && data.build) {
                            success(data, status, xhr);
                        } else {
                            error(xhr, status, data);
                        }
                    },
                    error );
    },
    get_auth_url_str: function() {
        if (this.get('type') == 'local') {
            return '&pairing=' + this.get('data').key + '&token=' + this.get('data').key; // send token as the pairing key to save a roundtrip fetching the token
        } else {
            return "&GUID=" + encodeURIComponent(this.get('data').guid) + '&bt_talon_tkt=' + encodeURIComponent(this.get('data').bt_talon_tkt);
        }
    },
    doreq: function(params, success, error, opts) {
        var client = this;
        if (client.get('type') == 'local') {
            if (typeof params == 'object') {
                var parts = [];
                for (var key in params) {
                    parts.push( key + '=' + encodeURIComponent(params[key]) );
                }
                var qs = parts.join('&');
            }  else {
                var qs = params;
            }
            var url = 'http://127.0.0.1:' + client.get('data').port + '/gui/?' + qs + this.get_auth_url_str();
            jQuery.ajax({
                url: url,
                dataType: 'jsonp',
                timeout: config.timeout_paired, // local uT should return response speedily
                success: function(data, status, xhr) {
                    if (data == 'invalid request') {
                        client.set_status('invalid pairing key');
                        return error(xhr, status, data);
                    } else if (data && data.build) {
                        client.set_status('available');
                    }
                    
                    if (success) {
                        success(data, status, xhr);
                    } else {
                        console.log('doreq success', params,data);
                    }
                },
                error: function(xhr, status, text) {
                    if (status == 'timeout') {
                        client.set_status('not responding');
                    } else {
                        client.set_status('doreq error');
                    }

                    if (error) {
                        error(xhr, status, text);
                    } else {
                        console.log('doreq error', text, params);
                    }
                }
            });
        } else {
            if (typeof params == 'string') {
                debugger;
            }
            var uri = (opts && opts.uri) ? opts.uri : '/gui/';
            client.api.request(uri,
                              {},
                              params,
                              function(data, status, xhr) {
                                  if (data && data.error == 'client timeout') {
                                      _this.set_status('offline');
                                      return error(xhr, status, data);
                                  } else if (data && data.code == 401) {
                                      // unauthorized key
                                      _this.set_status('unauthorized guid');
                                      return error(xhr, status, data);
                                  }
                                  if (success) {
                                      success(data, status, xhr);
                                  } else {
                                      console.log('doreq success', params, data);
                                  }
                              },
                              function(xhr, status, text) {
                                  if (status == 'timeout') {
                                      client.set_status('timeout');
                                  } else if (text && text.code == 401) {
                                      client.set_status('unauthorized guid');
                                  } else if (text && text.error == 'client timeout') {
                                      // client is not connected to
                                      // this specific saved server,
                                      // perhaps ask the database if
                                      // the client is still connected
                                      // here...
                                      client.fetch_server(function(info) {
                                          if (info && info.changed) {
                                              console.log('server changed');
                                              // re-try the request?
                                          } else {
                                          }
                                      });
                                      client.set_status('doreq error: ' + JSON.stringify(text));
                                  }
                                  
                                  if (error) {
                                      error(xhr, status, text);
                                  } else {
                                      console.log('doreq error', text, params);
                                  }
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
        if (this.get('type') == 'local') {
            this.update_timeout = setTimeout( this.do_update, this.paired_update_interval );
        } else {
            this.update_timeout = setTimeout( this.do_update, this.remote_update_interval );
        }
    },
    serialize: function() {
        var torrents_array = [];
        for (var i=0; i<this.torrents.models.length; i++) {
            torrents_array.push( this.torrents.models[i].serialize() );
        }
        var data = { torrentc: this.cacheid,
                     torrents: torrents_array };
        return data;
    },
    add_torrent: function(d) {
        var torrent = new Torrent( { id: d[0], data: d } );
        if (this.get('active_hash') == d[0]) {
            torrent.set('selected',true);
        }
        this.trigger('add_torrent', torrent);
        // if cacheid is outdated, adding here makes no sense...
        this.torrents.add(torrent);
        if (this.updates > 1) { // XXX RACE CONDITION
            // allow new torrents to be inserted in-order in an existing list (updates only)
            this.trigger('new_torrent', torrent);
        }
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
        this.trigger('setstatus', status);
    },
    check_status: function(cb) {
        app.display_status('Checking status');
        var _this = this;
        this.doreq( { nop: 1 },
                    function(data, status, xhr) {
                        console.log('check status success:', _this.get('status'));
                        if (cb) { cb(); }
                        app.send_message( { recipient: 'torrent', command: 'initialize' } );
                    },
                    function(xhr, status, text) {
                        console.log('check status error:', _this.get('status'));
                        if (cb) { cb(); }
                        app.send_message( { recipient: 'torrent', command: 'notify_status', id: _this.id, status: _this.get('status') } );
                    },
                    { uri: '/gui/token.html' }
                  );
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
    get_by_guid: function(guid) {
        for (var i=0; i<this.models.length;i++) {
            if (this.models[i].get('data').guid == guid) {
                return this.models[i];
            }
        }
    },
    get_by_id: function(id) {
        // XXX remove this useless function
        return this.get(id);
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

        if (opts && opts.broadcast) {
            // tell other gadget windows to switch...
            app.switch_to_client(found);
        }

        /*
          always do silent mode -- require people to manually tell other views to update
        if (opts && opts.silent) {
        } else {
            console.log('app',app.get('type'),'sending switch to client message');
            app.switch_to_client(found);
        }
        */
    },
    get_selected: function() {
        for (var i=0; i<this.models.length; i++) {
            if (this.models[i].get('selected')) {
                return this.models[i];
            }
        }
    },
    set_selected: function() {
        var selected = this.get_selected();
        if (selected) {
            this.selected = selected;
            if (window.app) {
                console.log(app.get('type'),'restored selected client',this.selected);
            }
        } else {
            console.log('init post fetch -- no client had selected attribute');
        }
    },
    init_post_fetch: function() {
        if (this.models.length == 0) {
            //debugger;
            if (app.get('type') == 'client') {
                this.find_local_clients( function(clients) {
                    //console.log('found clients',clients);
                });
            }
        } else {
            // set selected client if one has selected attribute
            this.set_selected();
        }
    },
    find_local_clients: function(callback) {
        var pairing = new Pairing();
        var _this = this;
        pairing.bind('pairing:found', function(opts) {
            opts.attempt_authorization = false;
            opts.authorize = false;
            var client = new Client( { type: 'local', data: opts } );
            // client.pair(); // dont pair automatically
            client.set('status','running');
            _this.add( client );


            if (_this.models.length == 1) {
                // first client found..
                _this.set_active(client, { broadcast: true } ); // maybe don't do this..
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
