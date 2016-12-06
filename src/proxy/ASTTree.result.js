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
                        "user_$id"
                    ]
                },
                {
                    "name": "set_header",
                    "params": [
                        "Host",
                        "$domain"
                    ]
                },
                {
                    "name": "set_header",
                    "params": [
                        "UserID",
                        "$mock_user"
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
            "location": [],
            "props": {}
        },
        {
            "domain": "api.qunar.com",
            "commands": [
                {
                    "name": "set_header",
                    "params": [
                        "Access-Control-Allow-Origin",
                        "*"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$node_server",
                        "'127.0.0.1:3008'"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$order",
                        "order"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$cookie1",
                        "login=true;expires=20160909"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$test",
                        "server_ip_$node_server"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$test",
                        "server_id_$id"
                    ]
                }
            ],
            "location": [
                {
                    "location": "/$flight/$order/detail",
                    "commands": [
                        {
                            "name": "proxy_pass",
                            "params": [
                                "http://$node_server/user/?domain=$domain"
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
                },
                {
                    "location": "~/(usercenter|userinfo)/",
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
                                "$flight",
                                "zdy_$id"
                            ]
                        }
                    ],
                    "props": {}
                }
            ],
            "props": {}
        }
    ],
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
                "$flight.example.com"
            ]
        },
        {
            "name": "set",
            "params": [
                "$id",
                "1234567"
            ]
        }
    ]
};