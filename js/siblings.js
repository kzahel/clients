/*




*/

var Siblings = Backbone.Model.extend({
    heartbeat: 2000,
    

    initialize: function(opts) {
        // keeps track of other tabs.
        this.data = {};
        assert(opts && opts.app);
        this.app = opts.app;
        var app = this.app
        this.heartbeat_interval = setInterval( function() {
            app.send_message({'recipient':'client', 'command':'heartbeat', 'iid':app.get('iid')});
        }, this.heartbeat);
    },


    register_heartbeat: function(msg) {
        if (this.app.get('iid') == msg.iid) {
            // heartbeat to self... ignore
        } else {
            console.log('got heartbeat',msg);
            var now = (new Date()).getTime();
            this.data[msg.iid] = { time: msg };
        }
    }


});