var TorrentCollection = Backbone.Collection.extend({
    initialize: function(models, opts) {
        var _this = this;
        this.client = opts.client;
        this.bind('selected', function(torrent) {
            _this.client.set('active_torrent', torrent);
        });
    },
    comparator: function(t) { return - t.attributes['added_on']; }
});

var Client = Backbone.Model.extend({
    initialize: function(data) {
        this.__name__ = 'Client';
        this.data = data;
        this.update_interval = 1000;
        this.cacheid = null;
        this.updating = false;
        this.torrents = new TorrentCollection( [], { client: this } );
        this.torrents.client = this;
        if (this.get('type') == 'remote') {
            this.api = new falcon.session( { client_data: this.data.data } );
        }

        _.bindAll(this);
        // sort by date added...
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
    on_pair_response: function(evt) {
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
        window.removeEventListener('message', this.on_pair_response);
    },
    pair: function() {
        var _this = this;
        var url = 'http://127.0.0.1:' + this.get('data').port + '/gui/pair?iframe=' + encodeURIComponent(window.location.href);
        $('#pairing_view').html('<div style="position: absolute; top:80px; left:80px"><iframe style="overflow:hidden; width:400px; height:200px;" id="pairing_frame" src="' + url + '"></iframe></div>');
        var iframe = $('#pairing_frame')[0];
        window.addEventListener('message', this.on_pair_response, false);
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
    start_updating: function() {
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
                    error: function(xhr, status, text) {
                        debugger;
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
                                      } else {
                                          debugger;
                                      }
                                  }
                                );
            }
        }
    },
    on_update: function(data) {
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

        if (! this.get('active_torrent')) {
            if (this.torrents.models.length > 0) {
                this.set('active_torrent', this.torrents.models[0]);
            }
        }

        this.trigger('update');

        this.update_timeout = setTimeout( this.do_update, this.update_interval );
    },
    add_torrent: function(d) {
        var torrent = new Torrent( { id: d[0], data: d } );
        this.trigger('add_torrent', torrent);
        // if cacheid is outdated, adding here makes no sense...
        this.torrents.add(torrent);
    },
    change_torrent: function(d) {
        var torrent = this.torrents.get(d[0]);
        if (torrent) {
            this.trigger('change_torrent', torrent);
            torrent.update(d);
        } else {
            this.add_torrent(d);
        }
    },
    remove_torrent: function(hash) {
        var torrent = this.torrents.get(hash);
        this.trigger('remove_torrent', torrent);
        this.torrents.remove(torrent);
    }
});

var ClientCollection = Backbone.Collection.extend( {
    localStorage: new Store('ClientCollection'),
    model: Client,
    initialize: function() {
        this.__name__ = 'ClientCollection';

        var _this = this;

        this.bind('selected', function(client) {
            _this.selected = client;
            torrentsview.set_client(client);
            activetorrentview.set_client(client);
        });

        this.bind('add', function(client) {
            if (! _this.selected) {
                client.trigger('selected',client);
            }
        });
    },
    init_post_fetch: function() {
        if (this.models.length == 0) {
            this.find_local_clients( function(clients) {
                //console.log('found clients',clients);
            });
        }
    },
    find_local_clients: function(callback) {
        var pairing = new Pairing();
        var _this = this;
        pairing.bind('pairing:found', function(opts) {
            opts.attempt_authorization = false;
            var client = new Client( { type: 'local', data: opts } );
            client.pair();
            //_this.add( client );

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


var Torrent = Backbone.Model.extend({
    meta: [
            { name: 'hash' },
            { name: 'status', type: 'int' , bits: ['started', 'checking', 'start after check', 'checked', 'error', 'paused', 'queued', 'loaded'] },
            { name: 'name' },
            { name: 'size', type: 'int' },
            { name: 'progress', type: 'int' },
            { name: 'downloaded', type: 'int' },
            { name: 'uploaded', type: 'int' },
            { name: 'ratio', type: 'int' },
            { name: 'up_speed', type: 'int' },
            { name: 'down_speed', type: 'int' },
            { name: 'eta', type: 'int' },
            { name: 'label' },
            { name: 'peers_connected', type: 'int' },
            { name: 'peers_swarm', type: 'int', alias: 'peers_in_swarm' },
            { name: 'seed_connected', type: 'int', alias: 'seeds_connected' },
            { name: 'seed_swarm', type: 'int', alias: 'seeds_in_swarm' },
            { name: 'availability', type: 'int' },
            { name: 'queue_position', type: 'int', alias: 'queue_order' },
            { name: 'remaining', type: 'int' },
            { name: 'download_url' },
            { name: 'rss_feed_url' },
            { name: 'message' }, // status message
            { name: 'stream_id' },
            { name: 'added_on', type: 'int' },
            { name: 'completed_on', type: 'int' },
            { name: 'app_update_url' },
            { name: 'directory' },
            { name: 'webseed_enabled' }
    ],
    initialize: function( opts ) {
        this.__name__ = 'Torrent';
        var data = opts.data;
        //this.data = data;
        for (var i=0; i<this.meta.length; i++) {
            this.set(this.meta[i].name, data[i]);
        }
/*
        this.bind('all', function(e) { 
            var parts = e.split(':');
            var attr = parts[1];
            if (attr) {
                console.log('torrent',this,e, this.get(parts[1]));
            }
        });
*/
    },
    update: function(arr) {
        var d = {}
        for (var i=1; i<this.meta.length; i++) {
            var key = this.meta[i].name;

            if (this.attributes[key] != arr[i]) {
                this.set(key, arr[i]);
            }
/*
            d[key] = arr[i];
            this.set( d );
*/
        }
    }
});

var ClientView = Backbone.View.extend({
    template: _.template( $('#client_template').html() ),
    initialize: function(opts) {
        //this.model = opts.model;
        this.updating = true;
        var _this = this;
        this.model.bind('destroy', function(m) {
            // remove from dom
            _this.el.parentNode.removeChild( _this.el );
        });

    },
    render: function() {
        this.$el.html( this.template() );


        if (this.model.get('type') == 'local') {
            this.$('.name').html(escape(this.model.get('data').name)+ ' (local)');
        } else {
            this.$('.name').html(escape(this.model.get('data').bt_user)+ ' (remote)');
        }
        var _this = this;
        this.$('.name').click( function(evt) {
            _this.updating = false;
            _this.model.trigger('selected', _this.model);
        });
        this.$('.close').click( function(evt) {
            console.log('close client',_this.model);
            _this.remove();
        });

        this.update();
        return this.el;
    },
    set_status: function(state) {
        this.$('.status').text(state);
    },
    remove: function() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.model.destroy();
        this.updating = false;
    },
    update: function() {
        var _this = this;
        if (this.model.get('type') == 'local') {
            jQuery.ajax({
                url: 'http://127.0.0.1:' + this.model.get('data').port + '/gui/foobar',
                dataType: 'jsonp',
                success: function(data) {
                    if (data == 'invalid request') {
                        _this.set_status('on');
                    } else {
                        debugger;
                        _this.set_status('?');
                    }
                    if (_this.updating) {
                        _this.timeout = setTimeout( _.bind(_this.update, _this), 30000 );
                    }
                },
                error: function(xhr, status, text) {
                    debugger;
                    _this.$('.status').text('off');
                }
            });
        } else {
            _this.model.api.request( 
                '/gui/',
                {getmsg:1},
                {},
                function(data) {
                    if (data.build) {
                        _this.$('.status').text('on');
                        if (_this.updating) {
                            _this.timeout = setTimeout( _.bind(_this.update, _this), 10000 );
                        }
                    } else {
                        _this.$('.status').text('off');
                    }
                },
                function(xhr, status, text) {
                    _this.$('.status').text('off');
                    if (text && text.error && text.code == 401) {
                        _this.model.invalidate_session();
                    } else {
                        debugger;
                    }
                }
            );
        }
        //console.log('update',this);
    }
});

var AddClientView = Backbone.View.extend({
    initialize: function(opts) {
        this.$el.html( this.template() );
        var _this = this;
        this.$('.add').click( function(evt) {
            var formdata = {};
            _.each( _this.$('.form').serializeArray(), function(d) {
                formdata[d.name] = d.value;
            });
            _this.login( formdata );
        });
    },
    template: _.template( $('#add_client_template').html() ),
    render: function() {
        //this.$el.html( this.template() );
    },
    login: function( formdata ) {
        this.$('.spinner').html('working...');
        var _this = this;
        var session = new falcon.session;
        session.negotiate( formdata.username, formdata.password, { 
            success: function(session) {
                var client = new Client( { type: 'remote', data: session.serialize() } );
                clients.add( client );
                client.save();
                _this.destroy();
            },
            error: function(xhr, status, text) {
                _this.$('.spinner').html(JSON.stringify(text));
            },
            progress: function(data) {
                _this.$('.spinner').html(JSON.stringify(data));
            }
        });
    },
    destroy: function() {
        this.$el.html('');
    }
});

var ClientsView = Backbone.View.extend({
    template: _.template( $('#clients_template').html() ),
    initialize: function() {

        this.$el.html( this.template() );
        var _this = this;
        this.$('.add').click( function(evt) {
            var view = new AddClientView( { el: $('#new_client_view'), clientsview: _this } );
            view.render();
        });


        this.model.bind('reset', function(a,b,c) {
            _.each( _this.model.models, function(client) {
                _this.add_client(client);
            });
        });


        this.model.bind('add', function(client) {
            _this.add_client(client);
        });

    },
    remove: function(clientview) {
        var _this = this;

    },
    add_client: function(client) {
        var view = new ClientView( { model: client } );
        this.$('.clients').append( view.render() );
    },
    render: function() {
        this.$('.clients').html('');
        var _this = this;
    }
    
});


var ActiveTorrentView = Backbone.View.extend({
    template: _.template( $('#active_torrent_template').html() ),
    initialize: function() {
        this.$el.html( this.template() );
        this.$('.add').click( function(e) {
            var view = new AddTorrentView( { el: $('#new_torrent_view') } );
            view.render();
        });
    },
    set_client: function(client) {
        if (this.client) {
            if (this.client != client) {
                this.client.stop_updating();
                // also clear the state completely?
            }
            this.client.set('active_torrent', null);
        }
        this.client = client;
        var _this = this;

        // --- xxx - _this scope getting weird... ? late binding etc
        this.client.bind('change:active_torrent', function(e,m) {
            _this.model =  _this.client.get('active_torrent');
            if (_this.model) {
                _this.model.bind('change', function(a,b,c,d) {
                    //console.log('torrent changed', this.get('id'), a,b,c,d);
                    _this.render();
                });
            }
            _this.render();
        });

        if (this.client.ready()) {
            this.client.start_updating();
        }
    },
    render: function() {
        if (this.model) {
            this.$('.name').text( this.model.get('name') );
        } else {
            this.initialize();
        }
    }
});

var TorrentView = Backbone.View.extend({
    template: _.template( $('#torrent_template').html() ),
    initialize: function(opts) {
        this.model.bind('destroy', function(m) {
            // remove from dom
            _this.el.parentNode.removeChild( _this.el );
        });
    },
    render: function() {
        var _this = this;
        this.$el.html( this.template() );
        this.$('.click_container').click( function(e) {
            _this.model.trigger('selected', _this.model);
        });

        this.$('.remove').click( function(e) {
            if (clients.selected && clients.selected.api) {
                clients.selected.api.request('/gui/',
                                             {action:'remove'},
                                             {hash:_this.model.get('hash')},
                                             function(data) {
                                                 console.log('remove success')
                                             },
                                             function(xhr, status, text) {
                                                 console.error('remove error');
                                             }
                                            );
            }
        });

        this.$('.name').text( this.model.get('name') );
        this.$('.status').text( this.model.get('downloaded') / this.model.get('size') * 100 );
        return this.el;
    }
});

var TorrentsView = Backbone.View.extend({
    template: _.template( $('#torrents_template').html() ),
    initialize: function() {
        this.$el.html( this.template() );
    },
    set_client: function(client) {
        this.client = client;

        var _this = this;
        this.client.bind('update', function() {
            _this.render();
        });

        this.render();
    },
    render: function() {
        this.$('.list').html(''); 
        var _this = this;
        if (this.client && this.client.torrents) {
            this.client.torrents.each( function(t) {
                if (! t.view) {
                    t.view = new TorrentView( { model: t } );
                }
                // losing click events :-(
                _this.$('.list').append( t.view.render() );
            });
        }
    }
});


var AddTorrentView = Backbone.View.extend({
    template: _.template( $('#add_torrent_template').html() ),
    initialize: function(opts) {
        this.$el.html( this.template() );
        var _this = this;
        this.$('.add').click( function(evt) {
            var formdata = {};
            _.each( _this.$('.form').serializeArray(), function(d) {
                formdata[d.name] = d.value;
            });
            _this.submit( formdata );
        });
        _.bindAll(this);
    },
    render: function() {
        //this.$el.html( this.template() );
    },
    submit: function( formdata ) {
        this.$('.spinner').html('working...');

        var _this = this;
        var client = clients.selected;
        if (client && client.api) {
            var url = formdata.url;

            client.api.request(
                '/gui/',
                {action:'add-url'},
                {s:url},
                function(data) {
                    _this.$('.spinner').html('done!');
                    _this.$('input[name=url]').val('');
                    _this.$el.fadeOut();
                    setTimeout( _this.destroy, 1000 );
                },
                function(xhr, status, text) {
                    _this.$('.spinner').html('error!');
                    debugger;
                }
            );

        }

    },
    destroy: function() {
        this.$el.show();
        this.$el.html('');
    }
});
