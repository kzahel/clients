var VERSION = 3.01;

(function() {
    if (! window.console) {
        window.console = { log: function(){},
                           error: function(){},
                           warn: function(){} };
    }

    var toolbar_config = {
        conduit_toolbar_message_key: 'ut_toolbar_main',
        conduit_toolbar_message_key_slave: 'ut_toolbar_gadget',

        torrent_pane_width: 178,
        client_pane_width: 370,
        cache_bust_version: VERSION,
        cache_bust: true
    };

    if (! window.config) {
        window.config = toolbar_config;
    } else {
        for (var key in toolbar_config) {
            window.config[key] = toolbar_config[key];
        }
    }
})();