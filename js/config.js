var UTORRENT_CONTROL_VERSION = 3.02;

(function() {
    if (! window.console) {
        window.console = { log: function(){},
                           error: function(){},
                           warn: function(){} };
    }

    var toolbar_config = {
        conduit_toolbar_message_key: 'ut_toolbar_main',
        conduit_toolbar_message_key_slave: 'ut_toolbar_gadget',

        client_pane_width: 178,
        torrent_pane_width: 370,
        torrent_pane_collapsed_width: 50,
        stats_url: 'http://remote-staging.utorrent.com/track',
        cache_bust_version: UTORRENT_CONTROL_VERSION,
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