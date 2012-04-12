var is_chrome = (navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/chromium/i));

function get_jQuery_version(jQueryObj) {
    var version;
    if (typeof jQuery == 'undefined' && jQueryObj == undefined) {
        return -1;
    } else if(jQueryObj){
        version = jQueryObj.fn.jquery.split('.');
    } else {
        version = window.jQuery.fn.jquery.split('.');
    }
    return (parseInt(version[0])*100) + (parseInt(version[1])*10) + parseInt(version[2]);
}

function toolbar_callback(msg) {
    //TODO Remove this workaround after conduit fix chrome
    if(is_chrome) {
        try {
            var sendMessageEvent = {'name': 'sendMessage','data': {key:msg},'sourceAPI': 'ToolbarApi','targetAPI': 'BcApi'};
            if (document && document.location && document.location.href.toUpperCase().indexOf('FACEBOOK.COM') === -1) {
                window.postMessage(JSON.stringify(sendMessageEvent), '*');
            }
        } catch(e) {
            console.error('BCAPI ERROR: ', e, e.stack);
        }
    } else {
        EBCallBackMessageReceived(msg);
    }
}

(function() {
    if (get_jQuery_version() < 151) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';

        function script_loaded_callback(){
            script.onload = script.onreadystatechange = null;
            window.jQueryInjected = jQuery.noConflict(true);
            toolbar_callback('jquery_initialized');
        }

        if(script.onreadystatechange !== undefined){//ie fix
            script.timer = setInterval( function(){
                    if (script.readyState == 'loaded' || script.readyState == 'complete'){
                        clearInterval(script.timer);
                        script_loaded_callback();
                    }
                }, 100
            );
        } else { //all other browsers
            script.onload = script_loaded_callback;
        }

        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
        head.appendChild(script);
    } else {
        window.jQueryInjected = window.jQuery;
        toolbar_callback('jquery_initialized');
    }
}());