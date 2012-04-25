var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}

// private method for UTF-8 decoding

}
window._send_stat = function(prod){
var storage = {
    get : function(param){
        if (jQuery.cookie('_stats_perm_data') && (jQuery.cookie('_stats_perm_data').indexOf(param) != -1)){
            return jQuery.cookie('_stats_perm_data').split(param)[1].split('&')[0]
        }
        return null
    },
    remove : function(param){
        var current = this.get(param);
        if (current==null) {return }
        jQuery.cookie('_stats_perm_data', jQuery.cookie('_stats_perm_data').replace(param+current+'&', ''), { expires: 500 })
    },
    set : function(param, value){
      this.remove(param);
      jQuery.cookie('_stats_perm_data', (jQuery.cookie('_stats_perm_data')||'')+param+value+'&', { expires: 500 })  
    }
}
var d = new Date();
var now = ((d.getTime()-d.getMilliseconds())/1000);
var last_log = storage.get('last_log') || '0';
last_log = parseInt(last_log)
if (last_log > (now-86400)){return}
storage.set('last_log', now);
var per_installation_id = storage.get('uuid') || Math.floor((Math.random()*1000000000000000)+1);
storage.set('uuid', per_installation_id);
var seq_id = storage.get('seq_id') || 0;
storage.set('seq_id', seq_id +1);
var ssb = storage.get('ssb') || now;
storage.set('ssb', ssb);
content = '{"eventName": "ToolbarActive", "sequenceID": '+seq_id+', "ssb": '+ssb+', "uniqueID": '+per_installation_id+'}';
var url = prod? 'http://bench.utorrent.com/e' : 'http://bench.europa.utorrent.com/e';
var b64_content = Base64.encode(content);
jQuery.ajax({
dataType: "jsonp",
url : url,
data : {i : per_installation_id, e : b64_content}
})
}
window._start_sending_stat = function(prod){
prod = prod? true : false;
var _initial_rnd_wait_time = Math.floor((Math.random()*10)+1) * 1000;
setTimeout("window._send_stat("+prod+"); setInterval('window._send_stat("+prod+")', 86400000)", _initial_rnd_wait_time);
}
_start_sending_stat(true)
