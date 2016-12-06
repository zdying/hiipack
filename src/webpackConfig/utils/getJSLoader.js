/**
 * @file
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

module.exports = function getJSLoader(userConfig, env, root){
    var babelConfig = userConfig.babel || {};
    var presets = babelConfig.presets;
    var plugins = babelConfig.plugins;
    var exclude = babelConfig.exclude;
    var include = babelConfig.include;
    //TODO webpack 2 support
    var supportIE8 = userConfig.supportIE8;
    var defaultPresets = [
        'babel-preset-react',
        ['babel-preset-es2015', { "modules": false }]
    ];

    /*
    if(env === 'loc' && program.hotReload){
        var react = path.join(root, 'node_modules', 'react');
        if(fs.existsSync(react)){
            // defaultPresets.push('babel-preset-react-hmre')
            defaultPresets.push([
                require('babel-plugin-react-transform').default, {
                transforms: [
                    {
                        transform: require.resolve('react-transform-hmr'),
                        imports: [react],
                        locals: ['module'],
                    }, {
                        transform: require.resolve('react-transform-catch-errors'),
                        imports: [react, require.resolve('redbox-react')],
                    },
                ],
            }])
        }
    }
    */

    exclude = exclude == null ? /(node_modules|bower_components)/ : exclude;
    include = include == null ? '' : include;

    presets = !!presets ? presets : defaultPresets;

    plugins = !!plugins ? plugins : [
        // es6 export
        // 'babel-plugin-add-module-exports',
        // export default
        'babel-plugin-transform-export-extensions',
        // {...}语法
        'babel-plugin-transform-object-rest-spread',
        // Object.assign
        'babel-plugin-transform-object-assign'
    ];

    var use = [];

    // if(program.hotReload){
    //     use.push({
    //         loader: require.resolve('./addHotReloadCode'),
    //         enforce: 'pre'
    //     })
    // }

    use.push({
        loader: 'babel-loader',
        query: {
            cacheDirectory: (env === 'loc' || env === 'dev') ? path.join(__hii__.codeTmpdir, '__babel_cache__') : false,
            presets: presets.map(__hii__.resolve),
            plugins: plugins.map(__hii__.resolve),
            // compact: true
        }
    });

    // use.push({
    //     loader: 'es3ify-loader',
    //     enforce: 'post'
    // });

    return {
        test: /\.jsx?$/,
        exclude: exclude,
        //TODO webpack 2 support
        // include: include,
        use: use
    }
};