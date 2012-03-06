function assert(v){if(!v){debugger;}}

function make_url_relative(url) {
    // conduit turns the url into an absolute url for some reason!
    //url = window.location.origin + url;
    if (url[0] == '/') {
        return window.location.origin + url;
    } else {
        var parts = window.location.pathname.split('/');
        var path = parts.slice(0,parts.length-1).join('/');
        return window.location.origin + path + '/' + url;
    }
}

function BTOpenGadget(url, w, h, extra_opts) {
    var opts = { 
      resizable:0,
      saveresizedsize:0,
      titlebar:0,
      closeonexternalclick:1,
      savelocation:0,
      openposition:'click'
    };
    if (extra_opts) {
        _.extend(opts, extra_opts);
    }
    var opts_str = _.map( opts, function(v,k) { return k + '=' + v; } ).join(','); // conduit has a weird api

    var abs_url = make_url_relative(url);
    OpenGadget(abs_url, w, h, opts_str);
}
