module.exports = {
    "commands": [
        {
            "name": "set",
            "params": [
                "$abc",
                "This_is_abc"
            ]
        }
    ],
    "props": {
        "$abc": "This_is_abc"
    },
    "domains": {
        "api.example.com": {
            "domain": "api.example.com",
            "commands": [
                {
                    "name": "proxy_pass",
                    "params": [
                        "http://$local/news/src/mock/list.json"
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
            "location": [
                {
                    "path": "/abc/",
                    "originPath": "/abc/",
                    "source": "api.example.com/abc/",
                    "commands": [
                        {
                            "name": "proxy_pass",
                            "params": [
                                "http://api.example.com/prd/This_is_abc"
                            ]
                        },
                        {
                            "name": "set_header",
                            "params": [
                                "Proxy",
                                "prd"
                            ]
                        }
                    ],
                    "props": {
                        "proxy": "http://api.example.com/prd/This_is_abc"
                    },
                    "parent": "_domain_api.example.com",
                    "parentID": "_domain_api.example.com"
                },
                {
                    "path": "/def/",
                    "originPath": "/def/",
                    "source": "api.example.com/def/",
                    "commands": [
                        {
                            "name": "proxy_pass",
                            "params": [
                                "http://api.example.com/prd/def/f"
                            ]
                        },
                        {
                            "name": "set_header",
                            "params": [
                                "Proxy",
                                "def"
                            ]
                        }
                    ],
                    "props": {
                        "proxy": "http://api.example.com/prd/def/f"
                    },
                    "parent": "_domain_api.example.com",
                    "parentID": "_domain_api.example.com"
                }
            ],
            "props": {},
            "__id__": "_domain_api.example.com",
            "parent": "global",
            "parentID": "global"
        }
    },
    "__id__": "global"
};