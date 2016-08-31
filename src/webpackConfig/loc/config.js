/**
 * @file development环境配置文件
 * @author zdying
 */
"use strict";

var fs = require('fs');
var path = require('path');

var color = require('colors');
var webpack = require('webpack');
// var WriteFilePlugin = require('write-file-webpack-plugin');
var common = require('../common');

module.exports = function(root, userConfig){
    // var userConfig = require('../hii.config');
    var projTmp = common.getProjectTMPDIR(root);
    var config = {
        env: 'loc',
        context: root,
        devtool: 'cheap-module-inline-source-map',
        entry: {},
        output: {
            path: projTmp + '/loc',
            filename: '[name].js',
            publicPath: '/loc/'
        },
        module: {
            loaders: [
                common.getBabelLoader(userConfig, 'loc'),
                { test: /\.css$/, loader: "style!css?sourceMap" },
                { test: /\.less$/, loader: "style!css?sourceMap!less?sourceMap&strictMath&noIeCompat" },
                { test: /\.scss$/, loader: "style!css?sourceMap!sass?sourceMap" }
            ],
            postLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['es3ify-loader']
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('development')
                }
            }),
            // new WriteFilePlugin({
            //     test: /\/static\//,
            //     log: false
            //     // useHashIndex: true
            // })
        ],
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
        },
        node: {
            fs: "empty"
        }
    };

    config = common.extendCustomConfig(root, userConfig, config);
    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);
    config.plugins = common.extendPlugins(config.plugins, ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig, 'loc');

    return config;
};