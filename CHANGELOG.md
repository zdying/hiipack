# 1.1.2

* rewrite支持ssl_certificate,ssl_certificate_key命令
* 添加--proxy-port参数
* https支持反向代理
* https代理支持SNI
* 支持proxy_set_cookie, proxy_hide_cookie
* 优化commond日志
* 支持代理：HTTP -> HTTPS和HTTPS  -> HTTP
* proxy中domain格式支持新语法:`domain xxx.com {`
* 内置HiipackCA根证书
* 内置localhost证书，支持`127.0.0.1`和`localhost`
* 增加SSL相关命令：`ssl create-root-ca`, `ssl create-cert`, `ssl ssl-path`
* `ssl create-cert`支持生成多域名证书

* fix bug: proxy_hide_header大小写问题
* fix bug: https访问目录时，图标加载失败
* fix bug: fix#13

# 1.1.1

* 优化proxy代码
* 优化proxy-rewrite代码
* fix bug: html文件中library中的entry版本号没有被替换替换
* fix bug：多次修改hosts/rewrite文件，遍历次数每次递增
* 修改proxy日志信息错误
* 去掉删除重复CSS的插件

# 1.0.10

* 代码优化
* 修改 proxy hosts bug
* 修改html中位置libray中的文件版本号没有被替换的bug
* 其他bugfix

# 1.0.9

* pac代理文件，支持改用http路径；
* 优化日志显示
* 支持非启动目录"根目录"的项目

# 1.0.8

* fixbug: 自动代理host匹配错误问题；
* 系统默认代理支持添加排除域名

# 1.0.7

* 修复bug: 配置文件使用`extend`字段时，如果没有`extend.plugins`字段，`statics`字段失效

# 1.0.6

* 修复bug: 代理服务器代理`POST`请求失败

# 1.0.5

* 支持HTTPS
* 修复bug：dev环境下如果entry中的key包含'/'时css文件404（不影响功能）
* 修复bug：sync上传多个目录报错的问题
* 代理服务支持`alias`和`root`指令，映射url到本地文件系统
* 优化代码，加快启动速度
* `__hiipack__`全局对象增加属性`env`（当前环境：loc/dev/prd）, 可以在配置文件中使用

# 1.0.4

* 支持HMR
* 优化初始化的项目模板
* 修复dev环境下css入口文件404的问题

* 配置文件更新后，不用重启 hiipack 了，刷新浏览器即可
* 支持rewrite／hosts刷新后不用重启服务
* 支持指令作用域，执行上一层的指令

* 优化日志Access显示；
* 日志支持显示时间（参数`--log-time`);

# 1.0.3-1

* fixbug: `location xxx {` 语法中空格问题
* 自动去除字符串首尾引号
* 代码优化

# 1.0.3

* support windows

* remove `hii init` step tips
* update `vue` demo (thanks [zhouhailong](https://github.com/zhouhailong) )

* support `css` auto prefix
* support `css`/`less`/`scss` loader config

* support open browser firefox/safari/opera
* support launch firefox with pac proxy
* support launch opera with pac proxy
* support dependence version

* pac proxy support system proxy

* hiipack config support

* fixbug: dll plugin `process.env.NODE_ENV` not right
