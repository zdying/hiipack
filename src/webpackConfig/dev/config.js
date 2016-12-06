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
var RemoveCssDuplicate = require('../../plugin/webpack/RemoveCssDuplicate');
var autoprefixer = require('autoprefixer');

var utils = require('../../helpers/utils');
var getJSLoader = require('../utils/getJSLoader');
var mergeConfig = require('../utils/mergeConfig');
var fixAlias = require('../utils/fixAlias');

module.exports = function(root, userConfig){
    var cssLoader = userConfig.css && userConfig.css.loader;
    var lessLoader = userConfig.less && userConfig.less.loader;
    var scssLoader = userConfig.scss && userConfig.scss.loader;

    var defaultCssLoader = "css-loader-loader!postcss-loader";
    var defaultLessLoader = "css-loader!less-loader!postcss-loader";
    var defaultScssLoader = "css-loader!sass-loader!postcss-loader";

    var config = {
        env: 'dev',
        entry: {},
        output: {
            path: path.resolve(root, 'dev'),
            filename: '[name]@dev.js',
            hashDigestLength: 32
        },
        module: {
            loaders: [
                getJSLoader(userConfig, 'dev'),
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
        ],
        node: {
            fs: "empty"
        },
        resolve: {
            // root: root,
            modules: [
                "node_modules",
                path.resolve(__hii__.packageTmpdir, "node_modules")
            ],
            extensions: ['.js', '.jsx', '.scss', '.json'],
            alias: fixAlias(userConfig.alias)
        },
        resolveLoader: {
            modules: [
                path.resolve(__hiipack__.root, "node_modules"),
                path.resolve(__hiipack__.packageTmpdir, "node_modules")
            ],
            // fallback: [path.resolve(__hiipack__.packageTmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config = mergeConfig(config, userConfig, 'dev', root);

    return config;
};