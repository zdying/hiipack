module.exports = {
    "commands": [
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
                "\"127.0.0.1:8800\""
            ]
        },
        {
            "name": "set",
            "params": [
                "$flight",
                "flight"
            ]
        },
        {
            "name": "set",
            "params": [
                "$test",
                "flight.example.com"
            ]
        },
        {
            "name": "set",
            "params": [
                "$id",
                "1234567"
            ]
        }
    ],
    "props": {
        "$domain": "api.example.com",
        "$local": "\"127.0.0.1:8800\"",
        "$flight": "flight",
        "$test": "flight.example.com",
        "$id": "1234567"
    },
    "__id__": "global",
    "usercenter.example.com": {
        "source": "usercenter.example.com",
        "props": {
            "proxy": "api.example.com/test"
        }
    },
    "flight.qunar.com/flight_qzz": {
        "source": "flight.qunar.com/flight_qzz",
        "props": {
            "proxy": "127.0.0.1:8800/flight_qzz"
        }
    },
    "api.example.com": {
        "source": "api.example.com",
        "commands": [
            {
                "name": "proxy_pass",
                "params": [
                    "http://127.0.0.1:8800/news/src/mock/"
                ]
            },
            {
                "name": "set",
                "params": [
                    "$id",
                    "1234"
                ]
            },
            {
                "name": "set",
                "params": [
                    "$mock_user",
                    "user_1234"
                ]
            },
            {
                "name": "set_header",
                "params": [
                    "Host",
                    "api.example.com"
                ]
            },
            {
                "name": "set_header",
                "params": [
                    "UserID",
                    "user_1234"
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
        "props": {
            "$id": "1234",
            "$mock_user": "user_1234"
        },
        "parent": "__parent__:global"
    },
    "api.qunar.com/flight/order/detail": {
        "source": "api.qunar.com/flight/order/detail",
        "commands": [
            {
                "name": "proxy_pass",
                "params": [
                    "http://127.0.0.1:3008/user/?domain=api.example.com"
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
        "props": {
            "proxy": "http://127.0.0.1:3008/user/?domain=api.example.com"
        },
        "parent": "__parent__:_domain_api.qunar.com"
    },
    "~ /api.qunar.com(usercenter|userinfo)/": {
        "source": "~ /api.qunar.com(usercenter|userinfo)/",
        "commands": [
            {
                "name": "set",
                "params": [
                    "$cookie",
                    "login=true;expires=20180808"
                ]
            },
            {
                "name": "proxy_pass",
                "params": [
                    "http://127.0.0.1:3008/info/"
                ]
            },
            {
                "name": "set_cookie",
                "params": [
                    "userID",
                    "200908204140"
                ]
            },
            {
                "name": "set_cookie",
                "params": [
                    "flight",
                    "zdy_1234567"
                ]
            }
        ],
        "props": {
            "$cookie": "login=true;expires=20180808",
            "proxy": "http://127.0.0.1:3008/info/"
        },
        "parent": "__parent__:_domain_api.qunar.com"
    }
};