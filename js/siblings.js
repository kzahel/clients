/*

Handles coordination of different toolbar tabs. One tab is "master"
tab.

Look in local storage for "master" iid. If that is my iid, good. Send
heartbeats.

If it is not my iid, and I do not see a heartbeat from that iid, and I
am the longest living among all tabs sending heartbeats, send a
heartbeat with "master" flag set.

*/

var Siblings = Backbone.Model.extend({
    heartbeat: 2000,
    

    initialize: function(opts) {
        // keeps track of other tabs.
        assert(opts && opts.app);
        this.app = opts.app;

        this.birth = new Date();
        this.current_master = jQuery.jStorage.get('master');
        this.am_master = false;

        this.data = {};

        this.heartbeat_interval = setInterval( _.bind(this.send_heartbeat, this) , this.heartbeat);
    },
    set_master: function(new_master) {
        var stored_master = jQuery.jStorage.get('master');
        this.current_master = new_master;
        if (new_master != stored_master) {
            jQuery.jStorage.set('master', new_master);
        }
    },
    claim_master: function() {
        console.log(this.app, 'claiming master');
        this.set_master( this.app.get('iid') );
        this.am_master = true;
    },
    send_heartbeat: function() {
        var msg = {'recipient':'client', 'command':'heartbeat', 'iid':this.app.get('iid')};
        if (this.am_master) {
            msg.master = true;
        }
        this.app.send_message(msg, {silent:true});
    },
    purge_inactives: function() {
        // removes instances that stopped sending heartbeats.
        var now = new Date()
        for (var k in this.data) {
            if (now - this.data[k].time > this.heartbeat * 2) {
                console.log('tab died', this.data[k]);
                delete this.data[k];
            }
        }
    },
    someone_is_master: function() {
        for (var k in this.data) {
            if (this.data[k].master) {
                return true;
            }
        }
    },
    register_heartbeat: function(msg) {
        var now = (new Date()).getTime();
        this.purge_inactives();

        if (this.app.get('iid') == msg.iid) {
            // heartbeat to self... ignore
        } else {
            console.log('got heartbeat',msg);
            var olddata = this.data[msg.iid];
            var data = { time: now, iid: msg.iid, master: msg.master };
            this.data[msg.iid] = data;
            if (data.master) {
                this.set_master(msg.iid);
            }
        }

        if ( this.am_master) {
            // nothing to do
        } else if (! this.someone_is_master() && now - this.birth > this.heartbeat * 2) {
            // sort tab ids alphabetically
            var instances = _.keys(this.data);
            instances.push( this.app.get('iid') );
            instances.sort();
            if (this.app.get('iid') == instances[0]) {
                this.claim_master();
            }

        }

    }

    


});