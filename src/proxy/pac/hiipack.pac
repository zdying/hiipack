var PROXY = "PROXY 127.0.0.1:4936";
var DIRECT = "DIRECT";

var DOMAINS = {
    "q.qunarzz.com": 1,
    "flight.qunar.com": 1,
    "flighta.qunar.com": 1,
    "joke1.oupeng.com": 1
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