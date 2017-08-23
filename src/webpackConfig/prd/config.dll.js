/**
 * @file production DLL配置文件
 * @author zdying
 */

var path = require('path');
var webpack = require("webpack");
var utils = require('../../helpers/utils');
var VersionPlugin = require('../../plugin/webpack/VersionPlugin');

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);

    return {
        context: root,
        entry: userConfig.library,
        // replaceVersion: userConfig.replaceVersion,
        output: {
            path: path.join(root, "prd"),
            filename: "[name].js",
            library: "__lib__[name]__"
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
            new webpack.DllPlugin({
                path: path.join(projTmp, "/dll/[name]-manifest.json"),
                name: "__lib__[name]__",
                context: root
            }),
            // new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true
                }
            }),
            new VersionPlugin(6)
        ]
    }
};
