/**
 * @file development环境配置文件
 * @author zdying
 */
"use strict";

var fs = require('fs');
var path = require('path');

var color = require('colors');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

var utils = require('../../helpers/utils');
var getBabelLoader = require('../utils/getBabelLoader');
var mergeConfig = require('../utils/mergeConfig');
var fixAlias = require('../utils/fixAlias');

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);
    var cssLoader = userConfig.css && userConfig.css.loader;
    var lessLoader = userConfig.less && userConfig.less.loader;
    var scssLoader = userConfig.scss && userConfig.scss.loader;

    var defaultCssLoader = "style!css?sourceMap!postcss";
    var defaultLessLoader = "style!css?sourceMap!less?sourceMap&strictMath&noIeCompat!postcss";
    var defaultScssLoader = "style!css?sourceMap!sass?sourceMap!postcss";

    var config = {
        env: 'loc',
        context: root,
        devtool: 'cheap-module-inline-source-map',
        entry: {},
        output: {
            path: path.join(projTmp, 'loc'),
            filename: '[name].js',
            publicPath: '/loc/'
        },
        module: {
            loaders: [
                getBabelLoader(userConfig, 'loc'),
                { test: /\.css$/, loader: cssLoader || defaultCssLoader },
                { test: /\.less$/, loader: lessLoader ||  defaultLessLoader},
                { test: /\.scss$/, loader: scssLoader || defaultScssLoader }
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
            alias: fixAlias(userConfig.alias)
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

    config = mergeConfig(config, userConfig, 'loc', root);

    return config;
};