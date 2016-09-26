/**
 * @file production环境配置文件
 * @author zdying
 */
"use strict";
var fs = require('fs');
var path = require('path');
var color = require('colors');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var autoprefixer = require('autoprefixer');

var VersionPlugin = require('../../plugin/webpack/VersionPlugin');
var RemoveCssDuplicate = require('../../plugin/webpack/RemoveCssDuplicate');

var utils = require('../../helpers/utils');
var getBabelLoader = require('../utils/getBabelLoader');
var mergeConfig = require('../utils/mergeConfig');
var fixAlias = require('../utils/fixAlias');

module.exports = function(root, userConfig){
    var cssLoader = userConfig.css && userConfig.css.loader;
    var lessLoader = userConfig.less && userConfig.less.loader;
    var scssLoader = userConfig.scss && userConfig.scss.loader;

    var defaultCssLoader = "css!postcss";
    var defaultLessLoader = "css!less!postcss";
    var defaultScssLoader = "css!sass!postcss";

    var config = {
        env: 'prd',
        context: root,
        entry: {},
        output: {
            path: path.join(root, 'prd'),
            filename: '[name].js',
            hashDigestLength: 32
        },
        module: {
            loaders: [
                getBabelLoader(userConfig, 'prd'),
                { test: /\.css$/, loader: ExtractTextPlugin.extract(cssLoader || defaultCssLoader) },
                { test: /\.less$/, loader: ExtractTextPlugin.extract(lessLoader ||  defaultLessLoader) },
                { test: /\.scss$/, loader: ExtractTextPlugin.extract(scssLoader || defaultScssLoader) }
            ],
            postLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['es3ify-loader']
                }
            ]
        },
        postcss: function() {
            return [autoprefixer];
        },
        plugins: [
            /**
             * 定义环境变量
             */
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            /**
             * 提取公共的css
             */
            new ExtractTextPlugin('[name].css'),
            /**
             * 去除重复的css
             * sass编译出来的代码包含重复的内容(多次import同一个文件,导致同一个文件多次打包)
             */
            new RemoveCssDuplicate(),
            /**
             * 压缩JS
             */
            new webpack.optimize.UglifyJsPlugin({
                test: /(\.jsx?)$/,
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true
                }
            }),
            /**
             * 生成版本号
             */
            new VersionPlugin(userConfig.hashLength || 6, userConfig.noVersionFiles || /static\//i)
        ],
        node: {
            fs: "empty"
        },
        resolve: {
            root: root,
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            extensions: ['', '.js', '.jsx', '.scss', '.json'],
            alias: fixAlias(userConfig.alias)
        },
        resolveLoader: {
            modulesDirectories: [path.resolve(__hiipack__.root, "node_modules")],
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config = mergeConfig(config, userConfig, 'prd', root);

    return config;
};