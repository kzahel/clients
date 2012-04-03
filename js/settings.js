var Settings = Backbone.Model.extend( {
    localStorage: new Store('Settings'),
    initialize: function() {
        this.id = 'settings';
        this.fetch();
    }
});