/**
 * @file 项目配置
 * @author zdying
 */
const webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var cssLoaders = require('./cssLoaders');

var resolve = function (dir) {
    return path.join(__dirname, dir);
};

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
    extend: {
        module: {
            loaders: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: cssLoaders({
                            sourceMap: __hii__.env === 'loc',
                            extract: __hii__.env !== 'loc',
                        })
                    }
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin("[name].css")
        ]
    }
};