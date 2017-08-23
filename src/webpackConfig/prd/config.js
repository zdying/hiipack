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
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

var VersionPlugin = require('../../plugin/webpack/VersionPlugin');


var getBabelLoader = require('../utils/getBabelLoader');
var getStyleLoader = require('../utils/getStyleLoader');

var mergeConfig = require('../utils/mergeConfig');
var fixAlias = require('../utils/fixAlias');

var es3ifyPlugin = require('es3ify-webpack-plugin');

module.exports = function(root, userConfig){

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
            rules: [getBabelLoader(userConfig, 'prd')].concat(getStyleLoader(userConfig, 'prd'))
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
            // Compress extracted CSS. We are using this plugin so that possible
            // duplicated CSS from different components can be deduped.
            new OptimizeCSSPlugin({
                cssProcessorOptions: {
                    safe: true
                }
            }),
            /*
             * Support old versions of ie, such as ie8.
             */
            new es3ifyPlugin(),
            /**
             * 压缩JS
             */
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true
                }
            }),
            /**
             * 生成版本号
             */
            new VersionPlugin(userConfig.hashLength || 6, userConfig.noVersionFiles || /static\//i),

            new ChunkManifestPlugin({
                filename: "manifest.json",
                manifestVariable: "webpackManifest"
            })
        ],
        node: {
            fs: "empty"
        },
        resolve: {
            modules: [
                path.resolve(__hiipack__.cwd, 'node_modules'),
                path.resolve(__dirname, 'node_modules'),
                root,
                path.resolve(__hiipack__.root, 'node_modules'),
                path.resolve(__hiipack__.packageTmpdir),
            ],
            extensions: ['.js', '.jsx', '.scss', '.json'],
            alias: fixAlias(userConfig.alias)
        },
        resolveLoader: {
            modules: [
                path.resolve(__hiipack__.root, "node_modules"),
                path.resolve(__hiipack__.packageTmpdir, "node_modules")
            ],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config = mergeConfig(config, userConfig, 'prd', root);

    return config;
};