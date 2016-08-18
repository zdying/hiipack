/**
 * @file production DLL配置文件
 * @author zdying
 */

var webpack = require("webpack");

module.exports = function(root){
    var userConfigPath = root + '/config';
    var userConfig = require(userConfigPath);

    return {
        context: root,
        entry: userConfig.library || {},
        output: {
            path: root + "/dev",
            filename: "[name]@dev.js",
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: root + "/dll/[name]-manifest.json",
                name: "__lib__[name]__",
                context: root
            }),
            new webpack.optimize.OccurenceOrderPlugin()
        ]
    }
};
