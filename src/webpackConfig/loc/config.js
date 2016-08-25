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
        entry: userConfig.entry,
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
        plugins: common.extendPlugins([
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
        ], ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig, 'loc'),
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

    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);
    config = common.extendCustomConfig(root, userConfig, config);

    return config;

    /*
     * 自动把library添加到入口
     * 自动添加组件demo入口
     * scr/component下的所有子目录,如果存在demo.js, 自动加入到entry
     */
    // function autoAddEntry(entry) {
    //     var fs = require('fs');
    //     var path = require('path');
    //
    //     var componentFolderPath = './src/components/';
    //     var files = fs.readdirSync(componentFolderPath);
    //     var demoFilePath = '';
    //
    //     files.forEach(function (fileName) {
    //         var stat = fs.statSync(componentFolderPath + fileName);
    //
    //         if(stat.isDirectory()){
    //             demoFilePath = path.resolve(componentFolderPath + fileName + '/demo.js');
    //             if(fs.existsSync(demoFilePath) && !entry[fileName]){
    //                 // console.log('[log] add entry: ', demoFilePath);
    //                 entry[fileName] = demoFilePath;
    //             }
    //         }
    //     });
    //     return entry;
    // }

};

// function getPlugins(root, userConfig){
//     var plugins = [
//         new webpack.DefinePlugin({
//             'process.env': {
//                 'NODE_ENV': JSON.stringify('development')
//             }
//         }),
//         new ProgressBarPlugin(),
//         // new WriteFilePlugin({
//         //     test: /\/static\//,
//         //     log: false
//         //     // useHashIndex: true
//         // })
//     ];
//
//     var a = common.getCopyWebpackPlugin(root, userConfig, plugins);
//     var b = common.getDllPlugin(root, userConfig, plugins);
//
//     a && plugins.push(a);
//     b && plugins.push(b);
//
//     return plugins;
// }