/**
 * @file
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

module.exports = function getBabelLoader(userConfig, env, root){
    var babelConfig = userConfig.babel || {};
    var presets = babelConfig.presets;
    var plugins = babelConfig.plugins;
    var exclude = babelConfig.exclude;
    var include = babelConfig.include;
    var defaultPresets = [['babel-preset-env', {
        "modules": false,
        "targets": {
            "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
    }], 'babel-preset-stage-0', 'babel-preset-react'];

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

    presets = !!presets ? presets : defaultPresets;

    plugins = !!plugins ? plugins : [
        // es6 export
        // 'babel-plugin-add-module-exports',
        // export default
        // 'babel-plugin-transform-export-extensions',

        'babel-plugin-transform-runtime'
        // ['babel-plugin-transform-runtime', {
        //     "polyfill": false, "regenerator": false
        // }],
        // Object.assign
        // 'babel-plugin-transform-object-assign',

        // {...}语法
        // 'babel-plugin-transform-object-rest-spread'
    ];

    var babelLoader = {
        test: /\.jsx?$/,
        exclude: exclude,
        loader: 'babel-loader',
        options: {
            cacheDirectory: (env === 'loc' || env === 'dev') ? path.join(__hii__.codeTmpdir, '__babel_cache__') : false,
            presets: presets.map(__hii__.resolve),
            plugins: plugins.map(__hii__.resolve),
            // compact: true
        }
    }

    if(include) {
        babelLoader.include = include;
    }

    return babelLoader;
};