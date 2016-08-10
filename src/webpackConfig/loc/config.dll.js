/**
 * @file development DLL配置文件
 * @author zdying
 */

var webpack = require("webpack");
var ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = function(root){
    var userConfigPath = root + '/config';
    var userConfig = require(userConfigPath);

    return {
        context: root,
        entry: userConfig.library,
        output: {
            path: root + "/loc",
            filename: "[name].js",
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: root + "/dll/[name]-manifest.json",
                name: "__lib__[name]__",
                context: root
            }),
            new ProgressBarPlugin()
        ],
        // resolve: {
        //     root: root,
        //     modulesDirectories: [root + "/node_modules"]
        // }
    }
};
