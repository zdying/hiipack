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
    var projectName = utils.getProjectName(root);
    var cssLoader = userConfig.css && userConfig.css.loader;
    var lessLoader = userConfig.less && userConfig.less.loader;
    var scssLoader = userConfig.scss && userConfig.scss.loader;

    var defaultCssLoader = "style-loader!css-loader?sourceMap!postcss-loader";
    var defaultLessLoader = "style-loader!css-loader?sourceMap!less-loader?sourceMap&strictMath&noIeCompat!postcss-loader";
    var defaultScssLoader = "style-loader!css-loader?sourceMap!sass-loader?sourceMap!postcss-loader";

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
            //TODO webpack 2 support
            preLoaders: program.hotReload ? [
                { test: /\.jsx?$/, loader: require.resolve('../utils/addHotReloadCode') }
            ] : [],
            rules: [
                getBabelLoader(userConfig, 'loc', root),
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
            // root: root,
            modules: [
                "node_modules",
                path.resolve(__hii__.packageTmpdir, "node_modules")
            ],
            // modules: [path.resolve(__hiipack__.packageTmpdir, "node_modules")],
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
            moduleExtensions: ['-loaders']
        },
        node: {
            fs: "empty"
        }
    };

    config = mergeConfig(config, userConfig, 'loc', root);

    addHMRClient(config);

    // console.log('merged config:', JSON.stringify(config, null, 4));

    return config;
};

function addHMRClient(config){
    if(program.hotReload === false){
        return config
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
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin()
    );

    return config;
}