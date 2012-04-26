var File = Backbone.Model.extend({
    meta: [
            { name: 'name' },
            { name: 'size' , type: 'int', unit: 'bytes' },
            { name: 'downloaded', type: 'int', unit: 'bytes' },
            { name: 'priority', type: 'int' },
            { name: 'first_piece', type: 'int' },
            { name: 'num_pieces', type: 'int' },
            { name: 'streamable', type: 'bool' },
            { name: 'encoded_rate', type: 'int' },
            { name: 'duration', type: 'int' },
            { name: 'width', type: 'int' },
            { name: 'height', type: 'int' },
            { name: 'stream_eta', type: 'int' },
            { name: 'streamability', type: 'int' }
    ],
    initialize: function( opts ) {
        this.__name__ = 'File';
        var data = opts.data;
        //this.data = data;
        for (var i=0; i<this.meta.length; i++) {
            this.set(this.meta[i].name, data[i]);
        }
    },
    serialize: function() {
        var arr = [];
        for (var i=0; i<this.meta.length; i++) {
            var k = this.meta[i];
            arr.push( this.get(k) );
        }
        return arr;
    },
    update: function(arr) {
        var d = {};
        for (var i=1; i<this.meta.length; i++) {
            var key = this.meta[i].name;
            d[key] = arr[i];
        }
        this.set( d );
    },
    started: function() {
        return true;
    },
    isCompleted: function() {
        return true;
    },
    get_url: function() {
        var torrent = this.collection.torrent;
        var client = torrent.collection.client;
        if (client.get('type') == 'local') {
            return 'http://127.0.0.1:' + client.get('data').port + '/proxy?sid=' + torrent.get('stream_id') + '&file=' + this.id + '&service=STREAMING' + client.get_auth_url_str();
        }
    },
    download: function() {
        var url = this.get_url();
        if (url) {
            window.open(url);
        }
    }
});

var FileCollection = Backbone.Collection.extend({
    initialize: function(models, opts) {
        var _this = this;
        this.torrent = opts.torrent;
        this.bind('selected', function(torrent) {
            // _this.client.set('active_torrent', torrent);
        });
        this.bind('remove', function(torrent) {
            // torrent.trigger('removed');
        });
        this.updates = 0;
/*
        this.bind('add', _.bind(function(torrent) {
            debugger;

        },this));
*/

    },
    do_update: function() {
        debugger;
    },
    sync: function(operation, collection, opts) {
        if (operation == 'read') {
            this.torrent.collection.client.doreq(
                { action: 'getfiles', hash: this.torrent.get('hash') },
                function(data, status, xhr) {
                    var hash = data.files[0];
                    var filedata = data.files[1];
                    for (var i=0; i<filedata.length; i++) {
                        var file = new File( { id: i, data: filedata[i] } );
                        if (this.updates > 0) {
                            collection.get(i).update(data);
                        } else {
                            collection.add(file);
                        }
                    }
                    this.updates++;
                },
                function(xhr, status, text) {
                    debugger;
                });
        } else {
            debugger;
        }
    },
    comparator: function(t) { return - t.attributes['name']; }
});
