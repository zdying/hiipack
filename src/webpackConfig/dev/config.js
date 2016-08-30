/**
 * @file production环境配置文件
 * @author zdying
 */
"use strict";

var fs = require('fs');
var path = require('path');
var color = require('colors');
var webpack = require('webpack');
// var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var RemoveCssDuplicate = require('../../plugin/webpack/RemoveCssDuplicate');

var common = require('../common');

module.exports = function(root, userConfig){
    var config = {
        env: 'dev',
        entry: {},
        output: {
            path: root + '/dev',
            filename: '[name]@dev.js',
            hashDigestLength: 32
        },
        module: {
            loaders: [
                common.getBabelLoader(userConfig, 'dev'),
                { test: /\.css$/, loader: ExtractTextPlugin.extract("css") },
                { test: /\.less$/, loader: ExtractTextPlugin.extract("css!less") },
                { test: /\.scss$/, loader: ExtractTextPlugin.extract("css!sass") }
            ],
            postLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['es3ify-loader']
                }
            ]
        },
        plugins: common.extendPlugins([
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            /**
             * 提取公共的css
             */
            new ExtractTextPlugin('[name]@dev.css'),

            /**
             * 去除重复的css
             * sass编译出来的代码包含重复的内容(多次import同一个文件,导致同一个文件多次打包)
             */
            new RemoveCssDuplicate()
        ], ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig, 'dev'),
        node: {
            fs: "empty"
        },
        resolve: {
            root: root,
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            extensions: ['', '.js', '.jsx', '.scss', '.json'],
            alias: common.fixAlias(userConfig.alias)
        },
        resolveLoader: {
            modulesDirectories: [path.resolve(__hiipack__.root, "node_modules")],
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config = common.extendCustomConfig(root, userConfig, config);
    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);

    return config;
};