var Torrent = Backbone.Model.extend({
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
    serialize: function() {
        var arr = [];
        for (var i=0; i<this.meta.length; i++) {
            var k = this.meta[i];
            arr.push( this.get(k) );
        }
        return arr;
    }
});