module.exports = {
    "funcs": [
        {
            "name": "set",
            "params": [
                "$domain",
                "api.example.com"
            ]
        },
        {
            "name": "set",
            "params": [
                "$local",
                "127.0.0.1:8800"
            ]
        }
    ],
    "props": {
        "$domain": "api.example.com",
        "$local": "127.0.0.1:8800"
    },
    "usercenter.example.com": {
        "source": "usercenter.example.com",
        "props": {
            "proxy": "userinfo.example.com"
        }
    },
    "flight.qunar.com/flight_qzz": {
        "source": "flight.qunar.com/flight_qzz",
        "props": {
            "proxy": "127.0.0.1:8800/flight_qzz"
        }
    },
    "$domain": {
        "source": "$domain",
        "commands": [
            {
                "name": "proxy",
                "params": [
                    "http://127.0.0.1:8800/news/src/mock/"
                ]
            },
            {
                "name": "set_header",
                "params": [
                    "Access-Control-Allow-Origin",
                    "*"
                ]
            }
        ],
        "props": {}
    },
    "api.qunar.com/user/": {
        "source": "api.qunar.com/user/",
        "commands": [
            {
                "name": "proxy",
                "params": [
                    "http://127.0.0.1:3008/user/"
                ]
            },
            {
                "name": "set_header",
                "params": [
                    "Set-Cookie",
                    "userID",
                    "200908204140"
                ]
            }
        ],
        "props": {}
    }
}