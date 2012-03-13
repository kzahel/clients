var UTORRENT_CONTROL_VERSION = 3.16;

(function() {

    var staging = (window.location.host.match('bar-staging.utorrent.com'));
    var prod = (window.location.host.match('bar.utorrent.com'));
    var kyledev = (window.location.host.match('192.168.56.1'));
    var is_firefox = navigator.userAgent.match(/firefox/i);

    if (! window.console) {
        window.console = { log: function(){},
                           error: function(){},
                           warn: function(){} };
    }

    var toolbar_config = {
        conduit_toolbar_message_key: 'ut_toolbar_main',
        //conduit_toolbar_message_key_slave: 'ut_toolbar_gadget',
        client_pane_width: 178,
        torrent_pane_width: 370,
        torrent_pane_collapsed_width: 50,
        stats_url: 'http://192.168.56.1:9090/track',
        remotelog_server: 'http://192.168.56.1:9090',
//        stats_url: 'http://remote-staging.utorrent.com/track',
        autologin_url: 'http://remote-staging.utorrent.com/talon/autologin', // can use remote client's server attribute...
//        autologin_url: 'http://192.168.56.1:9090/talon/autologin',
        cache_bust_version: UTORRENT_CONTROL_VERSION,
        cache_bust: true,
        compiled: false,
        verbose: 10
    };

    if (staging) {
        toolbar_config.cache_bust = false;
        toolbar_config.compiled = false;
        toolbar_config.autologin_url = 'http://remote-staging.utorrent.com/talon/autologin'; // can use remote client's server attribute...
        toolbar_config.stats_url = 'http://remote-staging.utorrent.com/track';
        toolbar_config.verbose = 1;
    } else if (kyledev) {
        toolbar_config.autologin_url = 'http://192.168.56.1:9090/talon/autologin';
    }

    if (! window.config) {
        window.config = toolbar_config;
    } else {
        for (var key in toolbar_config) {
            window.config[key] = toolbar_config[key];
        }
    }
})();
