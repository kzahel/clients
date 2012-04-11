
var ClientsView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template( $('#clients_template').html() );
        this.$el.html( this.template() );
        var _this = this;
/*
        this.$('.add').click( function(evt) {
            if (window.OpenGadget) {
                // toolbar mode
                app.open_gadget('login');

            } else {
                // web page mode
                var view = new AddClientView( { el: $('#new_client_view'), clientsview: _this } );
                view.render();
            }
        });
*/
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
        debugger;
        var _this = this;
    },
    add_client: function(client) {
        var view = new ClientView( { model: client } );
        this.$('.clients').append( view.$el );
    },
    render: function() {
        this.$('.clients').html('');
        var _this = this;
    }
    
});


var AddClientView = Backbone.View.extend({
    initialize: function(opts) {
        this.template = _.template( $('#add_client_template').html() );
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

    render: function() {
        //this.$el.html( this.template() );
    },
/*
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
*/
    destroy: function() {
        this.$el.html('');
    }
});



var ClientView = Backbone.View.extend({
    initialize: function(opts) {
        this.template = _.template( $('#client_template').html() );
        //this.model = opts.model;

        var _this = this;
        this.model.bind('destroy', function(m) {
            // remove from dom
            _this.el.parentNode.removeChild( _this.el );
        });

        this.model.bind('change:status', function(m) {
            _this.render();
        });

        this.model.bind('timeout', function(m) {
            _this.model.set_status('offline');
        });

        this.model.bind('preparing', function(m) {
            _this.model.set_status('preparing...');
        });

        this.model.bind('change', function(a,b,c) {
            _this.render();
        });

        this.$el.html( this.template() );
        this.trigger('view_active', this);

        this.$('.computer_name').click( function(evt) {
            //console.log('click on client', _this, 'selected:',_this.model.get('selected'));
            if (! _this.model.get('selected')) {
                _this.model.select();
            }
        });

        this.$('.remove_computer').click( function(evt) {
            console.log('remove client', _this);
            custom_track('remove_computer');
            _this.model.remove();
        });

        this.$('.remote_computer').click( function(evt) {
            if (_this.model.get('status') != 'available') {
                console.log('cannot setup... client not available');
                debugger;
            } else {
                custom_track('setup_remote_click');
                app.send_message({ recipient: 'clients', command: 'setup_remote', id: _this.model.id }, {local:true});
            }
        });

        this.render();
    },
    render: function() {
        if (! this.model) {
            this.$('.computer_name').html("Setup");
            return
        }
        if (this.model.get('status') == 'available' && this.model.get('type') == 'local') {
            this.$('.remote_computer').show();
        } else {
            this.$('.remote_computer').hide();
        }

        this.$('.computer_name').html(this.model.get_name());
	if (this.model.get('type') == 'local') {
	    this.$('.computer_location').html('(local)');
	} else {
	    this.$('.computer_location').html('(remote)');
	}

        if (app.get('type') == 'clients') {
            if (this.model.get('selected')) {
                this.$('.indie_computer_wrapper').addClass('selected');
            } else {
                this.$('.indie_computer_wrapper').removeClass('selected');
            }

            // computer_connected, computer_unavailable, computer_disconnected
            var status = this.model.get('status');
            if (status == 'available') {
                this.$('.computer_state').addClass('computer_connected');
		this.$('.computer_state').attr('title', 'Computer connected.');
            } else {
                if (this.model.get('type') == 'local') {
                    if (status == 'not running') {
                        this.$('.computer_state').addClass('computer_disconnected');
			this.$('.computer_state').attr('title', 'Computer disconnected.');
                    } else {
                        this.$('.computer_state').addClass('computer_unavailable');
			this.$('.computer_state').attr('title', 'Computer unavailable.');
                    }
                } else {
                    this.$('.computer_state').addClass('computer_unavailable');
		    this.$('.computer_state').attr('title', 'Computer unavailable.');
                }
            }
        } else {
            // these things don't show in the active client view
            this.$('.remote_computer').hide();
            this.$('.remove_computer').hide();
        }
    },
    destroy: function() {
        var parent = this.$el.parent();
        var id = this.$el.attr('id');
        this.unbind();
        this.remove();
        // backbone remove gets rid of the container which we want to re-use to re-attach another view
        parent.append( $('<div id="'+id+'"></div>') );
    }
});


var ActiveClientView = ClientView.extend( {
    initialize: function(opts) {
        this.template = _.template( $('#client_template').html() );
        this.$el.html( this.template() );
        var client = this.model;

        this.$el.click( function(evt) {
            if (client && client.get('type') == 'local' && client.running() && ! client.get('data').key) {
                // XXX -- the logic to determine whether to show which dialog is terrible...
                app.send_message( { recipient: 'client', command: 'pair', id: client.id }, {local:true} );
            } else {
                BTOpenGadget('clients.html', 286, 160, { openposition: 'offset:(25;30)' });
            }
        });
        this.render();
    }
})

