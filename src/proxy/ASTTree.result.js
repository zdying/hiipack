/**
 * @file
 * @author zdying
 */
module.exports = {
    "baseRules": [
        "usercenter.example.com => $domain/test",
        "flight.qunar.com/flight_qzz => 127.0.0.1:8800/flight_qzz"
    ],
    "domains": [
        {
            "domain": "$domain",
            "commands": [
                "proxy http://127.0.0.1:8800/news/src/mock/",
                "set_header Access-Control-Allow-Origin *"
            ],
            "location": [],
            "props": {}
        },
        {
            "domain": "api.qunar.com",
            "commands": [
                "set_header Access-Control-Allow-Origin *",
                "set $node_server 127.0.0.1:3008",
                "set $order order"
            ],
            "location": [
                {
                    "location": "/$flight/$order/detail",
                    "commands": [
                        "proxy http://$node_server/user/?domain=$domain",
                        "set_header Set-Cookie userID 200908204140"
                    ],
                    "props": {}
                },
                {
                    "location": "~/(usercenter|userinfo)/",
                    "commands": [
                        "proxy http://127.0.0.1:3008/info/",
                        "set_cookie userID 200908204140"
                    ],
                    "props": {}
                }
            ],
            "props": {}
        }
    ],
    "commands": [
        "set $domain api.example.com",
        "set $local 127.0.0.1:8800",
        "set $flight flight"
    ]
};