function EBDocumentComplete() {
    $("#uquest_button").attr('title', 'Initializing').text('');
    JSInjection("var mytext=document.createTextNode('inject text test'); document.getElementsByTagName('body')[0].appendChild(mytext); EBCallBackMessageReceived('links_number:'+ document.getElementsByTagName('a').length);");
}

function EBCallBackMessageReceived(msg, data) {
    var msg_parts = msg.split(':');
    var cmd = msg_parts[0];

    switch(cmd){
        case 'links_number' : {
            var links_number = msg.replace('links_number:', '');
            $("#uquest_button").attr('title', 'Ready').text(links_number);
            break;
        }
    }
}
