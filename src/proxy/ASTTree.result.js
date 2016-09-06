/**
 * @file
 * @author zdying
 */
module.exports = {
    "baseRules": [
        "usercenter.example.com => userinfo.example.com",
        "flight.qunar.com/flight_qzz => 127.0.0.1:8800/flight_qzz"
    ],
    "domains": [
        {
            "domain": "$domain",
            "commands": [
                "proxy http://127.0.0.1:8800/news/src/mock/",
                "set_header Access-Control-Allow-Origin *"
            ],
            "location": []
        },
        {
            "domain": "api.qunar.com",
            "commands": [
                "set_header Access-Control-Allow-Origin *"
            ],
            "location": [
                {
                    "location": "/user/",
                    "commands": [
                        "proxy http://127.0.0.1:3008/user/",
                        "set_header Set-Cookie userID 200908204140"
                    ]
                }
            ]
        }
    ],
    "commands": [
        "set $domain api.example.com",
        "set $local 127.0.0.1:8800"
    ]
};