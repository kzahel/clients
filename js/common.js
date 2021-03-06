function assert(v){if(!v){debugger;}}

var generateGUID = (typeof(window.crypto) != 'undefined' && 
                typeof(window.crypto.getRandomValues) != 'undefined') ?
    function() {
        // If we have a cryptographically secure PRNG, use that
        // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
        var buf = new Uint16Array(8);
        window.crypto.getRandomValues(buf);
        var S4 = function(num) {
            var ret = num.toString(16);
            while(ret.length < 4){
                ret = "0"+ret;
            }
            return ret;
        };
        return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-"+S4(buf[3])+"-"+S4(buf[4])+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
    }

    :

    function() {
        // Otherwise, just use Math.random
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

function decode_url_arguments() {
  var query = window.location.search;
  var parts = query.slice(1, query.length).split('&');
  var d = {};
  for (var i=0; i<parts.length; i++) {
    var kv = parts[i].split('=');
    d[kv[0]] = decodeURIComponent(kv[1]);
  }
    return d;
}

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
    var is_firefox = navigator.userAgent.match(/firefox/i);
    var is_msie = navigator.userAgent.match(/MSIE/i);
    var ff_fudge = is_firefox ? -39 : 0;

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

    var s = (abs_url.indexOf('?') == -1) ? '?' : '&';
    if (window.config && config.cache_bust) {
        abs_url = abs_url + s + 'v=' + (new Date()).getTime();
    } else if (window.config && config.cache_bust_version) {
        abs_url = abs_url + s + 'v=' + config.cache_bust_version;
    }

    OpenGadget(abs_url, w, h + ff_fudge, opts_str);
}

function SpacedExecution(spacing) {
    this.spacing = spacing;
    this.last_call = null;
    this.timer = null;
    this.queue = [];
}
SpacedExecution.prototype = {
    add: function(fn) {
        if (this.last_call) {
            this.queue.push( fn );
            this.process_queue();
        } else {
            console.warn('SpacedExecution: immediate');
            this.call(fn);
        }
    },
    call: function(fn) {
        this.last_call = new Date();
        fn();
    },
    process_queue: function() {
        if (this.timer) {
            this.timer = null;
        }
        var now = new Date();
        var delta = now - this.last_call;

        if (delta < this.spacing) {
            if (! this.timer) {
                console.warn('SpacedExecution: enqueueing');
                this.timer = setTimeout( _.bind(this.process_queue, this), this.spacing - delta );
            }
        } else {
            var fn = this.queue.shift();
            console.warn('SpacedExecution: popping');
            this.call(fn);
            if (this.queue.length > 0) {
                this.timer = setTimeout( _.bind(this.process_queue, this), this.spacing );
            }
        }
    }
};

var _bt_send_queue = new SpacedExecution(40);

function BTSendMessage(key, msg, opts) {
    if (opts && opts.silent) {
    } else {
        console.log('sending message',key,msg);
    }
    
    var fn = function() { StoreGlobalKey(key, msg) };
    _bt_send_queue.add( fn );
    //SendMessage(key, msg);
}

function BTSendTabMessage(key, msg, opts) {
    if (opts && opts.silent) {
    } else {
        console.log('sending local message',key,msg);
    }
    StoreKey(key, msg);
}


function BTCloseFloatingWindow(delay) {
    if (delay) {
        setTimeout( function() {
            CloseFloatingWindow();
        }, delay);
    } else {
        CloseFloatingWindow();
    }
}

function BTReload(app) {
    app.broadcast( { message: 'close floating windows' } );
    if (app.get('type') == 'client') {
        // only want this to be called by one component!
        RefreshToolbar();
    }
    //window.location.reload(); // seems to behave differently on different browsers
}

function custom_track(name, mydata) {
/*
    if (window.app && app.get('type') != 'client') {
        // forward stats tracking messages to the main frame (because it wont close randomly etc like gadget windows)
        app.send_message( { recipient: 'client', command: 'custom_track', data: { name: name, mydata: mydata } } );
        return
    }
*/
    var kvs = [];

    for (var k in mydata) {
        kvs.push( encodeURIComponent(k) + '=' + encodeURIComponent(mydata[k]) );
    }

    var full_stats_url = config.stats_url + '?name=' + encodeURIComponent(name) + '&' + kvs.join('&');
    jQuery.ajax( { url: full_stats_url,
                   jsonp: true,
                   callback: function() {}
                 } );
}

function remotelog(evtname, data){
    var dev = (window.location.host.match('192.168.56.1'));
    if (! dev) { return; }
    var s = { event: evtname, data: data };
    if (config.verbose > 1) {
        var server = config.remotelog_server;
        var url = server + '/remotelog?data='+encodeURIComponent(JSON.stringify(s));
        jQuery.ajax( { url: url,
                       dataType: 'jsonp',
                       success: function(){},
                       error: function(){}
                     } );
    }
}

function logger(a,b,c,d,e) {
    var args = [a,b,c,d,e];
    var s = '';
    for (var i=0; i<args.length; i++) {
        if (args[i] !== undefined) {
            s = s + ' ' + args[i];
        }
    }
    remotelog(s);
}

window.myconsole = { log: logger,
                     error: logger,
                     warn: logger };


var is_firefox = navigator.userAgent.match(/firefox/i)
if (is_firefox) {
    // only way known to debug toolbar in firefox is to jsonp log stuff
    window.console = window.myconsole;
}