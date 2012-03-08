

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
    get_status: function(opt_status) {
        var _this = this;
        var status = [];

        _.map( this.meta[1].bits, function(value, index) {
            if ( Math.pow(2, index) & (opt_status || _this.get('status')) ) {
                status.push( value );
            }
        });

        return status;
    },
    started: function() {
        return _.contains(this.status_array, 'started');
    },
    isCompleted: function() {
        return (this.downloaded == this.size);
    },
    initialize: function( opts ) {
        this.__name__ = 'Torrent';
        var data = opts.data;
        //this.data = data;
        for (var i=0; i<this.meta.length; i++) {
            this.set(this.meta[i].name, data[i]);
        }
        this.status_array = this.get_status();
    },
    update: function(arr) {
        var d = {}
        for (var i=1; i<this.meta.length; i++) {
            var key = this.meta[i].name;
            d[key] = arr[i];
        }
        this.status_array = this.get_status(d.status); // XXX -- this needs to happen before the "set" so that the change events get triggered
        this.set( d );
    },
    doreq: function(type) {
        var client = this.collection.client;
        if (client.get('type') == 'local') {
            jQuery.ajax({
                url: 'http://127.0.0.1:' + client.get('data').port + '/gui/?action=' + type + '&hash=' + this.get('hash') + '&pairing=' + client.get('data').key + '&token=' + client.get('data').key, // send token as the pairing key to save a roundtrip fetching the token,
                dataType: 'jsonp',
                success: function(data, status, xhr) {
                    if (data == 'invalid request') {
                        debugger;
                    }
                    console.log('doreq success',type,data);
                },
                error: function(xhr, status, text) {
                    console.log('doreq error',type);
                }
            });

        } else {
            client.api.request(
                '/gui/',
                {},
                { action: type, hash: this.get('hash') },
                function(data, status, xhr) {
                    console.log('doreq success',type,data);
                },
                function(xhr, status, text) {
                    console.log('doreq error',type);
                });
        }
    }
});


var TorrentCollection = Backbone.Collection.extend({
    initialize: function(models, opts) {
        var _this = this;
        this.client = opts.client;
        this.bind('selected', function(torrent) {
            _this.client.set('active_torrent', torrent);
        });
        this.bind('remove', function(torrent) {
            torrent.trigger('removed');
        });
    },
    comparator: function(t) { return - t.attributes['added_on']; }
});
