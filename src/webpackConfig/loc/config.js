/**
 * @file development环境配置文件
 * @author zdying
 */
"use strict";

var fs = require('fs');
var path = require('path');

var color = require('colors');
var webpack = require('webpack');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
// var WriteFilePlugin = require('write-file-webpack-plugin');
var common = require('../common');
var tmpdir = process.env.TMPDIR;

module.exports = function(root, userConfig){
    // var userConfig = require('../config');
    var config = {
        context: root,
        devtool: 'cheap-module-inline-source-map',
        entry: userConfig.entry,
        output: {
            path: root + '/loc',
            filename: '[name].js',
            publicPath: '/loc/'
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
                { test: /\.css$/, loader: "style!css?sourceMap" },
                { test: /\.less$/, loader: "style!css?sourceMap!less?sourceMap&strictMath&noIeCompat" },
                { test: /\.scss$/, loader: "style!css?sourceMap!sass?sourceMap" },
                { test: /\.vue/, loader: "vue" },
            ],
            postLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['es3ify-loader']
                }
            ]
        },
        vue: {
            loaders: {
                js: 'babel-loader?presets[]=' + require.resolve('babel-preset-es2015-loose') + '&plugins[]=' + require.resolve('babel-plugin-transform-runtime') + '&comments=false'
            }
        },
        plugins: common.extendPlugins([
            function () {
                 this.plugin("context-module-factory", function(cmf) {
                    cmf.plugin("after-resolve", function(result, callback) {
                        if(!result) return callback();

                        return callback(null, result);
                    });
                 });
            },
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('development')
                }
            }),
            new ProgressBarPlugin(),
            // new WriteFilePlugin({
            //     test: /\/static\//,
            //     log: false
            //     // useHashIndex: true
            // })
        ], ['CopyWebpackPlugin', 'DllPlugin'], root, userConfig),
        resolve: {
            root: root,
            fallback: [path.resolve(tmpdir, "node_modules")],
            extensions: ['', '.js', '.jsx', '.scss', '.json'],
            alias: userConfig.alias
        },
        resolveLoader: {
            modulesDirectories: [path.resolve(__hiipack_root__, "node_modules")],
            fallback: [path.resolve(tmpdir, "node_modules")],
            // extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
            // packageMains: ["webpackLoader", "webLoader", "loader", "main"]
        },
        node: {
            fs: "empty"
        },
        devServer: {
            // quiet: true,
            // historyApiFallback: true,
            // lazy: true,
            hot: true,
            inline: true,
            port: userConfig.port,
            setup: function(app){
                app.get('/*', function(req, res, next){
                    var urlObj = require('url').parse(req.url);
                    var pathname = urlObj.pathname;
                    // var pathNameArr = pathname.split('/');
                    var reg = /(.*?)\/prd\/(.*?)(@\w+)?\.(js|css)/;
                    var url = req.url;

                    if(pathname.match(/\.(scss)$/)){
                        var sass = require('node-sass');
                        var fileName = url.replace(/(.*?)\/prd\//, '..$1/src/');

                        // console.log('[log] compile sass file: ', url, ' ==> ', fileName);
                        console.log(['[log]'.yellow.bold, '[*.sass]', url.bold, '==>'.green, fileName.bold].join(' '));

                        sass.render({
                            file: fileName
                        }, function(err, result){
                            if(err){
                                res.end(err.stack || err.message)
                            }else{
                                res.setHeader('Content-Type', 'text/css');
                                res.end(result.css.toString())
                            }
                        });
                    }else if(pathname.match(reg)){
                        var devURL = req.url.replace(reg, '/loc/$2.$4');
                        console.log(['[log]'.yellow.bold, '[version]', url.bold, '==>'.green, devURL.bold].join(' '));
                        // 本地开发的时候,css都在js中, 返回空
                        if(RegExp.$4 === 'css'){
                            res.setHeader('Content-Type', 'text/css');
                            res.end('');
                            return
                        }
                        req.url = devURL;
                        next();
                    }else{
                        console.log('[log]'.magenta.bold, ('[direct] ' + url).magenta);
                        next();
                    }
                });
            }
        }
    };

    config.module.loaders = common.extendLoaders(config.module.loaders, root, userConfig, config);

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