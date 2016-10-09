var PROXY = "PROXY 127.0.0.1:4936";
var DIRECT = "DIRECT";

var DOMAINS = {
};

function FindProxyForURL(url, host) {
            host = host.toLowerCase();

            var hostArr = host.split('.');
            var length = hostArr.length;
            var subHost = "";

            if(length > 1){
                for(var i = 1; i <= length; i++){
                    subHost = hostArr.slice(-i).join('.');
                    if(subHost in DOMAINS){
                        return PROXY;
                    }
                }
            }

            return DIRECT;
        }