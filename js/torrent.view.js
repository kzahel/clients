
var AddTorrentView = Backbone.View.extend({
    initialize: function(opts) {
        this.template = _.template( $('#add_torrent_template').html() );
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



var TorrentView = Backbone.View.extend({
    initialize: function(opts) {
        this.template = _.template( $('#torrent_template').html() );
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
    initialize: function() {
        this.template = _.template( $('#torrents_template').html() );
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


var ActiveTorrentView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template( $('#active_torrent_template').html() );
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
        } else {
            this.client.trigger('preparing');
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
