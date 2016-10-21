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
        }
    ],
    "props": {
        "$domain": "api.example.com",
        "$local": "\"127.0.0.1:8800\""
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
                    "$mock_user",
                    "user_$id"
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
                    "user_$id"
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
            "$mock_user": "user_$id"
        },
        "parent": "__parent__:global"
    },
    "api.qunar.com/$flight/order/detail": {
        "source": "api.qunar.com/$flight/order/detail",
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
    }
};