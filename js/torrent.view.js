
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
    destroy: function() {
        this.unbind(); // does this actually do anything?
        //this.el.parentNode.removeChild( this.el ); // equivalent to this.remove()?
        this.remove();
        // do the parent insert element back thing... ?
    },
    bind_action_events: function() {
        var _this = this;
        this.$('.bt_button_x').click( function(evt) {
            console.log('remove torrent',_this.model);
            custom_track('remove_torrent');
            _this.model.doreq('remove');
        });

        this.$('.bt_button_play').click( function(evt) {
            console.log('play torrent',_this.model);
            custom_track('start_torrent');
            _this.model.doreq('start');
        });

        this.$('.bt_button_pause').click( function(evt) {
            console.log('pause torrent',_this.model);
            custom_track('stop_torrent');
            _this.model.doreq('stop');
        });
    },
    bind_events: function() {
        var _this = this;
        this.bind_action_events();
        this.model.bind('change', function(m) {
            // console.log('torrent change',_this.model.get('name'),_this.model.changedAttributes());
            _this.render();
        });
        this.$('.torrent_name').click( function(evt) {
            custom_track('select_torrent');
            _this.model.trigger('selected');
        });
    },
    initialize: function(opts) {
        this.template = _.template( $('#torrent_template').html() );
        this.$el.html( this.template() );
        this.$el.data( {id:this.model.id} );
        this.render();
        var _this = this;
        this.model.bind('removed', function(m) {
            // remove from dom
            _this.destroy();
        });
        //this.bind_events();
    },
    render: function() {
        var progress_width = Math.floor(1000 * this.model.get('downloaded')/this.model.get('size'))/10 + '%';

        if (this.model.get('selected')) {
            this.$('.bt_torrent_list').addClass('selected_torrent');
        } else {
            this.$('.bt_torrent_list').removeClass('selected_torrent');
        }

        this.$('.torrent_info').html( this.model.get('name') );
        this.$('.torrent_info_percent_complete').html( progress_width );

        // format the down speed
        this.$('.torrent_info_speed').html( to_file_size(this.model.get('down_speed')) + '/s' );
        this.$('.color_calc').css('width', progress_width);

        if (this.model.started()) {
            this.$('.bt_button_play').css('display','none');
            this.$('.bt_button_pause').css('display','block');
        } else {
            this.$('.bt_button_pause').css('display','none');
            this.$('.bt_button_play').css('display','block');
        }
        if (this.model.started()) {
            if (this.model.isCompleted()) {
                this.$('.torrent_dl_color').css('background-color','#86c440');
            } else {
                this.$('.torrent_dl_color').css('background-color','#3499ff');
            }
        } else {
            this.$('.torrent_dl_color').css('background-color','#cecece');
        }
        return this.$el;
    }
});

var TorrentsView = Backbone.View.extend({
    initialize: function() {
        var _this = this;

        this.model.bind('firstupdate', function() {
            _this.render();
        });

        this.model.bind('new_torrent', function(t) {
            console.log('add new torrent',t);
            if (! t.view) {
                t.view = new TorrentView( { model: t } );
            }
            _this.$el.prepend( t.view.render() );
        });

    },
    render: function() {
        this.$el.html('');
        var _this = this;
        if (this.model && this.model.torrents) {
            this.model.torrents.each( function(t) {
                console.log('render elt');
                if (! t.view) {
                    t.view = new TorrentView( { model: t } );
                }
                _this.$el.append( t.view.$el );
                t.view.bind_events();
            });
        }
        this.$el.append( $('<div>foo</div>') );
    }
});

var ActiveTorrentView = TorrentView.extend({
    initialize: function() {
        this.template = _.template( $('#torrent_template').html() );
        this.$el.html( this.template() );
	$('#torrent_controls').show();
        $('.default_container').hide();
        var _this = this;
        this.model.bind('change', function(model,opts) {
            // console.log('active torrent change',_this.model.get('name'),_this.model.changedAttributes());
            _this.render();
        });
        this.bind_action_events();
        this.render();

        this.model.collection.bind('new_torrent', function(t) {
            console.log('may want to replace current acitve torrent view with new torrent',t.get('name'));
        });


    }
});
