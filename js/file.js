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
    get_filename: function() {
        var parts = this.get('name').split('\\');
        return parts[parts.length-1];
    },
    get_url: function() {
        var torrent = this.collection.torrent;
        var client = torrent.collection.client;
        if (client.get('type') == 'local') {
            return 'http://127.0.0.1:' + client.get('data').port + '/proxy?sid=' + torrent.get('stream_id') + '&file=' + this.id + '&service=STREAMING' + client.get_auth_url_str();
        } else {
            if (true) {
                // make the url represent the name of the file... ( may need to url encode ? )
                var filename_option = '/' + this.get_filename();
            }
            return client.get('data').host + '/client/proxy'+filename_option+'?sid=' + torrent.get('stream_id') + '&file=' + this.id + '&service=STREAMING' + client.get_auth_url_str();
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
        this.updating = false;
        this.next_update = null;
        this.update_interval = 4000; // make it depend on # of files?
    },
    start_updating: function() {
        if (this.updating) { return; }
        this.updating = true;
        this.do_update();
    },
    do_update: function() {
        var _this = this;
        var cb = function() {
            _this.next_update = setTimeout( function() {
                _this.do_update();
            }, _this.update_interval);
        }

        this.fetch( { success: cb,
                      error: cb
                    } );
    },
    reset: function(a,b,c) {
        // don't reset on sync...
    },
    sync: function(operation, collection, opts) {
        if (operation == 'read') {
            this.torrent.collection.client.doreq(
                { action: 'getfiles', hash: this.torrent.get('hash') },
                function(data, status, xhr) {
                    console.log('got getfiles update');
                    var hash = data.files[0];
                    var filedata = data.files[1];
                    for (var i=0; i<filedata.length; i++) {
                        if (collection.updates > 0) {
                            collection.get(i).update(filedata[i]);
                        } else {
                            var file = new File( { id: i, data: filedata[i] } );
                            collection.add(file);
                        }
                    }
                    collection.updates++;
                    if (opts && opts.success) { opts.success(); }
                },
                function(xhr, status, text) {
                    debugger;
                    if (opts && opts.error) { opts.error(); }
                });
        } else {
            debugger;
        }
    },
    comparator: function(t) { return - t.attributes['name']; }
});
