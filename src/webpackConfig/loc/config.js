/**
 * @file development环境配置文件
 * @author zdying
 */
"use strict";

var fs = require('fs');
var path = require('path');

var color = require('colors');
var webpack = require('webpack');
// var autoprefixer = require('autoprefixer');

var utils = require('../../helpers/utils');
var getBabelLoader = require('../utils/getBabelLoader');
var getStyleLoader = require('../utils/getStyleLoader');
var mergeConfig = require('../utils/mergeConfig');
var fixAlias = require('../utils/fixAlias');

var es3ifyPlugin = require('es3ify-webpack-plugin');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);
    var projectName = utils.getProjectName(root);

    var rules = [getBabelLoader(userConfig, 'loc')].concat(getStyleLoader(userConfig, 'loc'));

    var config = {
        env: 'loc',
        context: root,
        devtool: 'cheap-module-inline-source-map',
        entry: {},
        output: {
            path: path.join(projTmp, 'loc'),
            filename: '[name].js',
            publicPath: '/' + projectName + '/loc/'
        },
        module: {
            rules: rules
        },
        plugins: [
            /*
             * Support old versions of ie, such as ie8.
             */
            new es3ifyPlugin(),

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

            //在 HMR 更新的浏览器控制台中打印更易读的模块名称 
            new webpack.NamedModulesPlugin(),

            /**
             * 提取公共的css
             */
            // new ExtractTextPlugin('[name].css'),

            // new webpack.LoaderOptionsPlugin({
            //     options: {
            //         postcss: function(){
            //             return [ require("autoprefixer")({ browsers: ['ie>=8','>1% in CN'] }) ]
            //         }
            //     }
            // })

        ],
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
                path.resolve(__hiipack__.cwd, 'node_modules'),
                path.resolve(__hiipack__.root, "node_modules"),
                path.resolve(__hiipack__.packageTmpdir, "node_modules")
            ],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        },
        node: {
            fs: "empty"
        }
    };

    config = mergeConfig(config, userConfig, 'loc', root);

    // TODO 暂时不启用hot-reload，有BUG待解决
    // addHMRClient(config);

    // console.log('merged config:', JSON.stringify(config, null, 4));

    return config;
};

function addHMRClient(config){
    if(program.hotReload === false){
        return config
    }

    // preloaders
    if(program.hotReload) {
        config.module.rules.push({
            test: /\.jsx?$/,
            enforce: "pre",
            loader: require.resolve('../utils/addHotReloadCode')
        })
    }

    var entry = config.entry;
    var hotURL = require.resolve('webpack-hot-middleware/client') + '?path=http://127.0.0.1:' + program.port + '/__webpack_hmr';

    for (var key in entry) {
        var _entry = entry[key];
        if (Array.isArray(_entry)) {
            _entry.indexOf(hotURL) === -1 && _entry.unshift(hotURL)
        } else {
            entry[key] = [hotURL, _entry];
        }
    }

    config.plugins.push(
        new webpack.HotModuleReplacementPlugin()
    );

    return config;
}