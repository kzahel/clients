

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
