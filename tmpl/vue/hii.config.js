/**
 * @file 项目配置
 * @author zdying
 */

// var ExtractTextPlugin = require("extract-text-webpack-plugin");

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
                { test: /\.vue$/, loader: require.resolve('vue-loader') }
            ],
            plugins: [
                // new ExtractTextPlugin("[name].css")
            ]
        }
    },
    vue: {
        loaders: {
            html: require.resolve('vue-html-loader'),
            // vue: 'babel-loader?presets[]=' + __hiipack__.resolve('babel-preset-es2015-loose') + '&plugins[]=' + __hiipack__.resolve('babel-plugin-transform-runtime') + '&comments=false',
            css: require.resolve('vue-style-loader') + '!css!sass',
            // css: ExtractTextPlugin.extract(require.resolve('vue-style-loader') + '!css!sass'),
            // sass: ExtractTextPlugin.extract(require.resolve('vue-style-loader') + '!css!sass'),
            // scss: ExtractTextPlugin.extract(require.resolve('vue-style-loader') + '!css!sass')
        }
    }
};