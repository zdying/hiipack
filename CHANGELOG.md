# 1.0.5

* 支持HTTPS
* 修改bug：dev环境下如果entry中的key包含'/'时css文件404（不影响功能）

* 修改bug：sync上传多个目录报错的问题

* 代理服务支持`alias`和`root`指令，映射url到本地文件系统

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
