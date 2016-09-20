/**
 * @file development DLL配置文件
 * @author zdying
 */

var path = require('path');
var webpack = require("webpack");
var utils = require('../../helpers/utils');

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);

    return {
        context: root,
        entry: userConfig.library,
        output: {
            path: path.join(projTmp, "loc"),
            filename: "[name].js",
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: path.join(projTmp, "/dll/[name]-manifest.json"),
                name: "__lib__[name]__",
                context: root
            })
        ],
        // resolve: {
        //     root: root,
        //     modulesDirectories: [root + "/node_modules"]
        // }
    }
};
