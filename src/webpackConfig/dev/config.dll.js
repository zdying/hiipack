/**
 * @file production DLL配置文件
 * @author zdying
 */

var webpack = require("webpack");
var utils = require('../../helpers/utils');

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);

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
                path: projTmp + "/dll/[name]-manifest.json",
                name: "__lib__[name]__",
                context: root
            }),
            new webpack.optimize.OccurenceOrderPlugin()
        ]
    }
};
