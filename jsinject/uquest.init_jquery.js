(function() {
    function onload(){
        EBCallBackMessageReceived('jquery_initialized');
    };

    if (!window.jQuery) {
        var src = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        //---start IE fix---
        if(window.ActiveXObject){//ie fix T_T
            var xmlhttp = null;
            try {
                xmlhttp = new XMLHttpRequest();
            }catch(e){
                try{
                    xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
                }catch(e){
                    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                }
            }
            xmlhttp.onreadystatechange  = function() {
                try{
                    if(this.done!==undefined)
                        return;

                    if(this.status >= 200 && this.status < 300){//loaded
                        this.done=true;
                        script.text=this.responseText;
                        document.getElementsByTagName('head')[0].appendChild(script);
                        onload();
                    }
                    if(this.status >= 400){
                        this.done=true;
                    }
                } catch(e) {}
            };
            xmlhttp.open('get', src, true);
            xmlhttp.send(null);

        }
        else{//browser that support script.onload/onerror
            script.src = src;
            script.async = true;
            script.onload = onload;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
        //---end IE fix---
    }
}());