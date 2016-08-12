/**
 * @file production环境配置文件
 * @author zdying
 */
"use strict";

var path = require('path');
var color = require('colors');
var webpack = require('webpack');
// var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
// var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var common = require('../common');
var tmpdir = process.env.TMPDIR;

module.exports = function(root){
    var userConfig = require(root + '/config');
    var config = {
        entry: userConfig.entry,
        output: {
            path: root + '/dev',
            filename: '[name]@dev.js',
            hashDigestLength: 32
        },
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel',
                    query: {
                        presets: ['babel-preset-react', 'babel-preset-es2015-loose'/*, 'stage-0'*/].map(require.resolve),
                        plugins: [
                            // es6 export
                            'babel-plugin-add-module-exports',
                            // export default
                            'babel-plugin-transform-export-extensions',
                            // {...}语法
                            'babel-plugin-transform-object-rest-spread',
                            // Object.assign
                            'babel-plugin-transform-object-assign'
                        ].map(require.resolve)
                    }
                },
                { test: /\.css$/, loader: ExtractTextPlugin.extract("css") },
                { test: /\.less$/, loader: ExtractTextPlugin.extract("css!less") },
                { test: /\.scss$/, loader: ExtractTextPlugin.extract("css!sass") },
                { test: /\.vue/, loader: "vue" },
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
             * 进度条
             */
            new ProgressBarPlugin()
        ], ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig),
        vue: {
            loaders: {
                js: 'babel-loader?presets[]=' + require.resolve('babel-preset-es2015-loose') + '&plugins[]=' + require.resolve('babel-plugin-transform-runtime') + '&comments=false'
            }
        },
        node: {
            fs: "empty"
        },
        resolve: {
            root: root,
            fallback: [path.resolve(tmpdir, "node_modules")],
            extensions: ['', '.js', '.jsx', '.scss', '.json'],
            alias: userConfig.alias
        },
        resolveLoader: {
            modulesDirectories: [path.resolve(__hiipack__.root, "node_modules")],
            fallback: [path.resolve(tmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);

    return config;
};