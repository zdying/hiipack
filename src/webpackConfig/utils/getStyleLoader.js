/**
 * @file
 * @author zhl
 */

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function getStyleLoader(userConfig, env){
    var cssLoader = userConfig.css && userConfig.css.loader;
    var lessLoader = userConfig.less && userConfig.less.loader;
    var scssLoader = userConfig.scss && userConfig.scss.loader;

    var defaultCssLoader = ["css-loader", "postcss-loader"];
    var defaultLessLoader = ["css-loader", "postcss-loader, less-loader"];
    var defaultScssLoader = ["css-loader", "postcss-loader, sass-loader"];

    if(env === 'loc') {
        var css = {loader: "css-loader", options: {sourceMap: true}};
        var less = {loader: "less-loader", options: {sourceMap: true, strictMath: true, noIeCompat: true}};
        var scss = {loader: "sass-loader", options: {sourceMap: true}};

        defaultCssLoader = ['style-loader', css, "postcss-loader"];
        defaultLessLoader = ['style-loader', css, "postcss-loader", less];
        defaultScssLoader = ['style-loader', css, "postcss-loader", scss];

        return [
            {
                test: /\.css$/, use:  cssLoader || defaultCssLoader
            },
            {
                test: /\.less$/, use:  lessLoader || defaultLessLoader
            },
            {
                test: /\.(sass|scss)$/, use: scssLoader || defaultScssLoader
            }
        ];
    }

    return [
        { test: /\.css$/, loader: ExtractTextPlugin.extract({
            use: cssLoader || defaultCssLoader,
            fallback: 'style-loader'
        }) },
        { test: /\.less$/, loader: ExtractTextPlugin.extract({
            use: lessLoader ||  defaultLessLoader,
            fallback: 'style-loader'
        }) },
        { test: /\.(sass|scss)$/, loader: ExtractTextPlugin.extract({
            use: scssLoader || defaultScssLoader,
            fallback: 'style-loader'
        }) }
    ];
};