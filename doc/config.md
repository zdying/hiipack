# 配置


## 配置文件

### 配置文件位置



### 基础配置文件


### 环境配置文件





## 配置字段


### 基础配置字段



### 扩展配置字段




## webpack配置文件




## 完整配置

```javascript
/** 配置文件中可以使用__hiipack__/__hii__全局变量 **／

// console.log('---------- visit global variable -----------');
// console.log(__hiipack__.cwd);
// console.log(__hiipack__.root);
// console.log(__hiipack__.tmpdir);
// console.log(__hiipack__.resolve('webpack'));
// console.log('---------- visit global variable -----------');

module.exports = {
    /**
     * 需要单独打包的第三方库
     * 例如: {lib: ['react', 'react-dom']}
     * 会把'react'和'react-dom'打包到lib.js
     */
    library: {
        lib: ['jquery', 'backbone']
    },

    /**
     * 业务代码入口
     */
    entry: {
        main: "src/main",
    },

    /**
     * 别名
     */
    alias: {
        'root': 'src/'
    },


    /**
     * 测试框架配置, 目前只支持mocha
     */
    autoTest: {
        framework: 'mocha',
        assertion: 'expect'
        // assertion: ['expect', 'assert']
    },

    less: {},

    scss: {},

    css: {
        loader: ''
    },

    // js: {
    //     loader: ''
    // },

    // html: {
    //     loader: ''
    // },
    
    /**
     * 扩展配置， 这里的配置会合并到默认的配置， 上面所有的配置会覆盖默认配置
     */
    extend: {
        module: {
            loaders: [
                // { test: /\.(mustache|html)$/, loader: 'mustache' }
                {
                    // 'mustache-loader': { test: /\.(mustache|html)$/, loader: 'mustache' }
                    'mustache mustache-loader': function(loader, path){
                        // console.log('callback   ====> ', loader, path)
                        return { test: /\.(mustache|html)$/, loader: 'mustache' }
                    }
                }
            ]
        },
        plugins: [
            function(){
                console.log('custom plugin 1');
            },
            {
                'date-format': function(dateFormat, pkgPath){
                    console.log('callback2: data-format,', dateFormat, pkgPath);
                    return function(){
                        console.log('custom plugin 2, date =>', dateFormat('yyyy-MM/dd hh||mm//ss.SSS', new Date()));
                    }
                },
                'underscore float-math': function(_, math, _path, mathPath){
                    console.log('callback3: data-utils,', _, math, _path, mathPath);
                    return function(){
                        console.log('custom plugin 3', 0.3 - 0.2, math.sub(0.3, 0.2), _.isEmpty([1, 2, 3]), _path, mathPath);
                    }
                }
            }
        ]
    },

    /**
     * 需要替换版本号的文件夹, 该目录下的所有html文件中的版本号会被替换
     */
    replaceVersion: 'src/',

    /**
     * babel配置
     */
    babel: {
        plugins: null,
        presets: ['babel-preset-react', 'babel-preset-es2015-loose'],
        include: null,
        exclude: null
    }
};

```