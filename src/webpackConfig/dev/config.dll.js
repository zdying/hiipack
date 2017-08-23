/**
 * @file production DLL配置文件
 * @author zdying
 */

var webpack = require("webpack");
var utils = require('../../helpers/utils');
var path = require('path');

module.exports = function(root, userConfig){
    var projTmp = utils.getProjectTMPDIR(root);

    return {
        context: root,
        entry: userConfig.library || {},
        output: {
            path: path.resolve(root, "dev"),
            filename: "[name]@dev.js",
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
            })
        ]
    }
};
