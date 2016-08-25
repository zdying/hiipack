/**
 * @file production DLL配置文件
 * @author zdying
 */

var webpack = require("webpack");
var common = require('../common');
var VersionPlugin = require('../../plugin/webpack/VersionPlugin');

module.exports = function(root){
    var userConfigPath = root + '/hii.config';
    var userConfig = require(userConfigPath);
    var projTmp = common.getProjectTMPDIR(root);

    return {
        context: root,
        entry: userConfig.library,
        output: {
            path: root + "/prd",
            filename: "[name].js",
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: projTmp + "/dll/[name]-manifest.json",
                name: "__lib__[name]__",
                context: root
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({
                test: /(\.jsx?)$/,
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
