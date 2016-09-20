/**
 * @file 项目配置
 * @author zdying
 */

module.exports = {
    /**
     * 需要单独打包的第三方库
     * 例如: {lib: ['react', 'react-dom']}
     * 会把'react'和'react-dom'打包到lib.js
     */
    library: {},
    /**
     * 业务代码入口
     */
    entry: {
        test: 'src/js/main.js'
    },
    /**
     * 别名
     */
    alias: {
        'root': 'src/'
    },
    // loaders: {
    //     // 所有环境下（`hii pack`）都使用
    //     '*': [
    //         { test: /\.vue$/, loader: 'vue' }
    //     ]
    // },
    vue: {
        loaders: {
            js: 'babel-loader?presets[]=' + __hiipack__.resolve('babel-preset-es2015-loose')
              + '&plugins[]=' + __hiipack__.resolve('babel-plugin-transform-runtime') + '&comments=false'
        }
    }
};