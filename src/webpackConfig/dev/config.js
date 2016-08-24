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
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var common = require('../common');

module.exports = function(root){
    var userConfig = require(root + '/hii.config');
    var config = {
        env: 'dev',
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
             * 优化CSS
             * sass编译出来的代码包含重复的内容(多次import同一个文件,导致同一个文件多次打包)
             * 其他的CSS优化
             */
            new OptimizeCssAssetsPlugin({
                // assetNameRegExp: /\.css$/g,
                // cssProcessor: require('cssnano'),
                // cssProcessorOptions: { discardComments: {removeAll: true } },
                canPrint: false
            }),

            // function(){
            //     this.plugin("done", function(stats){
            //         var assets = stats.compilation.assets;
            //
            //         var handerChunk = function(fileName, filePath){
            //             if(fileName.slice(-4) === '.css'){
            //                 var postcss = require('postcss');
            //                 var css = fs.readFileSync(filePath).toString();
            //                 postcss([ require('postcss-discard-duplicates'), require('postcss-discard-comments') ])
            //                     .process(css/*, { from: filePath, to: filePath }*/)
            //                     .then(function (result) {
            //                         fs.writeFileSync(filePath, result.css);
            //                         // if ( result.map ) fs.writeFileSync('app.css.map', result.map);
            //                     });
            //             }
            //         };
            //
            //         for(var fileName in assets){
            //             var info = assets[fileName];
            //             var filePath = info.existsAt;
            //
            //             handerChunk(fileName, filePath);
            //         }
            //     });
            // }
        ], ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig),
        node: {
            fs: "empty"
        },
        resolve: {
            root: root,
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            extensions: ['', '.js', '.jsx', '.scss', '.json'],
            alias: userConfig.alias
        },
        resolveLoader: {
            modulesDirectories: [path.resolve(__hiipack__.root, "node_modules")],
            fallback: [path.resolve(__hiipack__.tmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        }
    };

    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);
    config = common.extendCustomConfig(root, userConfig, config);

    return config;
};