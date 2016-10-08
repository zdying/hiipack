# 代理服务

## 配置文件

### 配置文件位置


### 配置文件查找规则


## 语法

### domain

### location

### 命令

### 注释


## 配置字段

### 全局

### domain

### location



## 命令作用域

### request

### response


## 变量作用域


## 命令

### set

### proxy_pass

### proxy_set_header

### proxy_set_cookie

### proxy_hide_header

### proxy_hide_cookie

### set_header

### set_cookie

### hide_header

### hide_cookie


## 配置文件例子

```
## url rewrite rules

# page.example.com => hii.com;
#
# json.example.com => 127.0.0.1:8800;
#
## rewrite folder
# api.example.com/user/ => {
#     proxy_pass other.example.com/user/;
#
#     ## proxy request config
#     proxy_set_header host api.example.com;
#     proxy_set_header other value;
#     proxy_hide_header key;
#
#     proxy_set_cookie userid 20150910121359;
#     proxy_hide_cookie sessionid;
#
#     ## response config
#     set_header Access-Control-Allow-Origin *; ## allow CORS
#     set_cookie sessionID E3BF86A90ACDD6C5FF49ACB09;
#     hide_header key;
#     hide_cookie key;
# }
## regexp support
# ~ /\/(demo|example)\/([^\/]*\.(html|htm))$/ => {
#    proxy_pass http://127.0.0.1:9999/$1/src/$2;
#
#    set_header Access-Control-Allow-Origin *;
# }


## simple rewrite rule
usercenter.example.com => $domain/test;
flight.qunar.com/flight_qzz => 127.0.0.1:8800/flight_qzz;

set $domain api.example.com;
set $local 127.0.0.1:8800;
set $flight flight;
set $test $flight.example.com;
set $id 1234567;

## standard rewrite url
$domain => {
    proxy_pass http://127.0.0.1:8800/news/src/mock/;

    set $id 1234;
    set $mock_user user_$id;

    set_header Host $domain;
    set_header UserID $mock_user;
    set_header Access-Control-Allow-Origin *;
}

# api.example.com => {
#     proxy_pass http://$local/news/src/mock/list.json;
#     set_header Access-Control-Allow-Origin *;
# }

api.qunar.com => {
    set_header Access-Control-Allow-Origin *;

    set $node_server 127.0.0.1:3008;
    set $order order;
    set $cookie1 login=true;expires=20160909;

    location /$flight/$order/detail {
        proxy_pass http://$node_server/user/?domain=$domain;
        set_header Set-Cookie userID 200908204140;
    }

    location ~ /(usercenter|userinfo)/ {
        set $cookie login=true;expires=20180808;
        proxy_pass http://127.0.0.1:3008/info/;
        set_cookie userID 200908204140;

        set $id user_iddddd;

        set_cookie $flight zdy_$id;
    }
}
```

