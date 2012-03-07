
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
        this.$el.html( this.template() );
        this.model.bind('destroy', function(m) {
            // remove from dom
            _this.el.parentNode.removeChild( _this.el );
        });
    },
    render: function() {
        var progress_width = Math.floor(this.model.get('progress')/10) + '%';

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
        this.model.bind('update', function() {
            _this.render();
        });
    },
    render: function() {
        //this.$('.list').html(''); 
        this.$el.html('');
        var _this = this;
        if (this.model && this.model.torrents) {
            this.model.torrents.each( function(t) {
                if (! t.view) {
                    t.view = new TorrentView( { model: t } );
                }
                // losing click events :-(
                _this.$el.append( t.view.render() );
            });
        }
    }
});

var ActiveTorrentView = TorrentView.extend({
    initialize: function() {
        this.template = _.template( $('#torrent_template').html() );
        this.$el.html( this.template() );

        var _this = this;
        this.model.bind('change', function(model,opts) {
            console.log('torrent changed!',model.changedAttributes());
            _this.render();
        });

    }
});
