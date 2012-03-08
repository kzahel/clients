function assert(v){if(!v){debugger;}}

function to_file_size(size) {
  var precision = 1;
  var sz = ['b', 'kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb'];
  var szmax = sz.length-1;

  // Force units to be at least kB
  var unit = 1;
  size /= 1024;

  while ((size >= 1024) && (unit < szmax)) {
    size /= 1024;
    unit++;
  }
  return (size.toFixed(precision || 1) + " " + sz[unit]);
}

function make_url_relative(url) {
    // conduit turns the url into an absolute url for some reason!
    //url = window.location.origin + url;
    var origin = window.location.protocol + '//' + window.location.host;
    if (window.location.port) {
        origin = origin + ':' + window.location.port;
    }

    if (url[0] == '/') {
        return origin + url;
    } else {
        var parts = window.location.pathname.split('/');
        var path = parts.slice(0,parts.length-1).join('/');
        return origin + path + '/' + url;
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

function BTSendMessage(key, msg) {
    console.log('sending message',key,msg);
    SendMessage(key, msg);
}