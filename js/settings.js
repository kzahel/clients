var Settings = Backbone.Model.extend( {
    localStorage: new Store('Settings'),
    initialize: function(opts) {
        this.id = 'settings';
        this.fetch();
    }
});