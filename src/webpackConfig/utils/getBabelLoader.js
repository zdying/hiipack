/**
 * @file
 * @author zdying
 */

module.exports = function getBabelLoader(userConfig, env){
    var babelConfig = userConfig.babel || {};
    var presets = babelConfig.presets;
    var plugins = babelConfig.plugins;
    var exclude = babelConfig.exclude;
    var include = babelConfig.include;
    var supportIE8 = userConfig.supportIE8;

    exclude = exclude == null ? /(node_modules|bower_components)/ : exclude;
    include = include == null ? '' : include;

    presets = !!presets ? presets : [
        'babel-preset-react',
        supportIE8 ? 'babel-preset-es2015-loose' : 'babel-preset-es2015'
    ];

    plugins = !!plugins ? plugins : [
        // es6 export
        'babel-plugin-add-module-exports',
        // export default
        'babel-plugin-transform-export-extensions',
        // {...}语法
        'babel-plugin-transform-object-rest-spread',
        // Object.assign
        'babel-plugin-transform-object-assign'
    ];

    return {
        test: /\.jsx?$/,
        exclude: exclude,
        include: include,
        loader: 'babel',
        query: {
            cacheDirectory: (env === 'loc' || env === 'dev') ? __hii__.codeTmpdir + '/__babel_cache__' : false,
            presets: (presets).map(__hii__.resolve),
            plugins: (plugins).map(__hii__.resolve)
        }
    }
};