
var ClientsView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template( $('#clients_template').html() );
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



var ClientView = Backbone.View.extend({
    initialize: function(opts) {
        this.template = _.template( $('#client_template').html() );
        //this.model = opts.model;
        this.updating = true;
        var _this = this;
        this.model.bind('destroy', function(m) {
            // remove from dom
            _this.el.parentNode.removeChild( _this.el );
        });

        this.model.bind('timeout', function(m) {
            _this.set_status('offline');
        });

        this.model.bind('preparing', function(m) {
            _this.set_status('preparing...');
        });

        this.model.bind('change:status', function(a,b,c) {
            debugger;
            _this.set_status(a);
        });

        this.$el.html( this.template() );
        this.trigger('view_active', this);

        this.$('.computer_name').click( function(evt) {
            debugger;
            console.log('switch to client', _this);
            _this.model.trigger('selected', _this.model);

        });

        this.$('.remove_computer').click( function(evt) {
            console.log('remove client', _this);
            // remove computer
            debugger;
            _this.remove();
        });

        this.$('.remote_computer').click( function(evt) {
            console.log('login client', _this);
            debugger;
        });


    },
    render: function() {
        if (this.model.get('type') == 'local') {
            this.$('.name').html(escape(this.model.get('data').name)+ ' (local)');
        } else {
            this.$('.name').html(escape(this.model.get('data').bt_user)+ ' (remote)');
        }
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
});

