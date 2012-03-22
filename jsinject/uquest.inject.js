(function () {
    var uQuest = {
        _is_active : true,
        _selector : 'a',
        _class : 'utorrent-uquest-inject',
        init : function() {
        },
        set_state : function(active) {
            this._is_active = active;
            if(this._is_active){
                jQuery(this._selector).addClass(this._class);
            } else {
                jQuery(this._selector).removeClass(this._class);
            }
        }
    };

    window.QuestModule = uQuest;
    uQuest.init();

}());