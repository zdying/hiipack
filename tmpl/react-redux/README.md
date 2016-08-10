### 运行

    # 如果没有安装`webpack-dev-server`和`webpack`
    npm install webpack-dev-server webpack -g

    npm install
    npm start

### 编译

    # production, 生成versions.mapping, 压缩代码
    npm run build
    # development
    npm run build-dev

### 地址

    # 首页
    http://localhost:8080/

    # 使用react的例子
    http://localhost:8080/src/component/demo/index-react.html

    # 直接使用sass的例子
    http://localhost:8080/src/component/demo/

### 入口文件配置

入口文件配置在`webpack.entry.js`中

### 直接使用`sass`

在html文件中直接引入:

    <link rel="stylesheet" href="/$PROJECT_NAME$/prd/component/demo/index.scss">
    <!-- 或者 -->
    <link rel="stylesheet" href="/$PROJECT_NAME$/src/component/demo/index.scss">

**注意**

`/prd/`会自动转换成`/prd/`
