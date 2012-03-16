var QuestSettings = Backbone.Model.extend({
    defaults: function() {
        return {
            Active: true
        };
    },
    switch_state: function() {
        this.set("Active", !this.get("Active"));
    },
    localStorage: new Store("QuestSettings")
});

var QuestView = Backbone.View.extend({
    el: "#uquest_button",
    initialize: function(){
        this.model.fetch();
        this.update_view();
    },
    events: {
        "click": "on_click"
    },
    on_click: function( ){
        this.model.fetch();
        this.model.switch_state();
        this.model.save();
        this.update_view();
    },
    update_view: function() {
        var is_active = this.model.get("Active");
        if(is_active){
            this.$el.removeClass("inactive").attr('title', 'Turn Off uQuest');
        } else {
            this.$el.addClass("inactive").attr('title', 'Turn On uQuest');
        }
    }
});

jQuery(document).ready(function () {
    window.QuestButtonView = new QuestView( {model: new QuestSettings({ id: 1 })});
});