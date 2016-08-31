/**
 * @file
 * @author zdying
 */
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var fs = require('fs');
var child_process = require('child_process');
var extend = require('extend');

var pkg = require('../helpers/package');

module.exports = {
    getDllPlugin: function(root, userConfig){
        var library = userConfig.library;
        var projTmp = this.getProjectTMPDIR(root);
        if(library && Object.keys(library).length > 0){
            //TODO 遍历`dll`目录中的文件,添加`manifest.json`
            log.debug('webpackConfig -', 'use dll file', projTmp + "/dll/lib-manifest.json");
            return new webpack.DllReferencePlugin({
                context: root,
                manifest: require(projTmp + "/dll/lib-manifest.json")
            })
        }
    },

    getCopyWebpackPlugin: function(root, userConfig){
        var statics = userConfig.statics;
        if(statics){
            if(!Array.isArray(statics)){
                statics = [statics];
            }
            return new CopyWebpackPlugin(statics)
        }
    },

    getUserConfig: function(root, env){
        var map = {
            'loc': 'development',
            'dev': 'beta',
            'prd': 'production'
        };
        var baseConfig = require(root + '/hii.config');
        var envConfig = {};
        try{
            envConfig = require(root + '/hii.config.' + map[env]);
            log.debug('merge', ('`hii.config.' + map[env] + '.js`').bold.green, 'to', '`hii.config.js`'.bold.green);
            return extend(true, {}, baseConfig, envConfig)
        }catch(e){
            log.debug(('`hii.config.' + map[env] + '.js`').bold.yellow, 'not exists, return', '`hii.config.js`'.bold.green);
            return baseConfig
        }
    },

    extendPlugins: function(arr, plugins, root, userConfig, env){
        var self = this;
        if(!Array.isArray(plugins)){
            log.error('invalid param', 'plugins'.bold.yellow);
        }else{
            plugins.forEach(function(plName){
                if(!/Plugin$/.test(plName)){
                    plName += 'Plugin';
                }

                var plugin = self['get' + plName](root, userConfig);
                plugin && arr.push(plugin)
            });
        }

        arr = this._extendPlugins(arr, root, userConfig, env);

        return arr
    },

    extendLoaders: function(loaders, root, userConfig, config){
        var env = config.env;
        var customLoaders = userConfig.loaders || [];
        var self = this;

        if(!customLoaders || Array.isArray(customLoaders) === false){
            return loaders
        }

        customLoaders.forEach(function(loader, index){
            /*
            {
                loaders: {
                    '*' : [
                        // type1
                        {loader: 'babel', test: /\.js$/},
                        {
                            // type2
                            'dep1': function(dep1, dep1Path){
                                return {loader: 'babel', test: /\.js$/}
                            },
                            // type3
                            'dep2': {loader: 'babel', test: /\.js$/}
                        }
                    ],
                    'dev': [
                        // ...
                    ]
                }
            };
            */

            if(loader.loader){
                // type1 ==> 直接使用loader
                self.installLoader(loader);
                loaders.push(loader);
            }else{
                // type2/type3 ==> 先安装,然后设置
                for(var pkgs in loader){
                    var currLoader = loader[pkgs];
                    var currLoaderType = typeof currLoader;
                    var loaderResult = null;

                    if(currLoaderType === 'function'){
                        // type2
                        loaderResult = self.installCustomDependencies(pkgs, 'loaders', currLoader);
                    }else if(currLoaderType === 'object' && currLoader !== null){
                        // type3
                        self.installCustomDependencies(pkgs, 'loaders', null);

                        log.debug('loader config is object:', JSON.stringify(currLoader));
                        loaderResult = currLoader
                    }

                    self.installLoader(loaderResult);

                    loaders.push(loaderResult)
                }
            }
        });

        return loaders
    },

    _extendPlugins: function(plugins, root, userConfig, config){
        var env = config.env;
        var customPlugins = userConfig.plugins;
        var userPlugins = null;
        var self = this;

        if(!customPlugins || Object.keys(customPlugins).length === 0){
            return plugins
        }

        customPlugins.forEach(function(plugin, index){
            if(typeof plugin.apply === 'function'){
                log.debug('is callable plugin');
                log.detail(plugin);
                plugins.push(plugin);
            }else if(typeof plugin === 'object'){
                for(var pl in plugin){
                    plugins.push(self.installCustomDependencies(pl, env + '-plugin', plugin[pl]))
                }
            }
        });

        return plugins
    },

    installCustomDependencies: function(pkgs, type, cbk){
        var installed = pkg.installPackageAndDependencies(pkgs, type);

        var params = pkgs.split(' ').map(function(pkgName){
            return pkg.getPackagePath(pkgName);
        });
        var modules = params.map(function(p){
            return require(p)
        });

        if(typeof cbk === 'function'){
            log.debug('call plugin config callback ...');
            var result = cbk.apply(null, modules.concat(params));
            log.debug('loader config callback result:', typeof result === 'function' ? result : JSON.stringify(result));

            return result
        }
    },

    installLoader: function(loader){
        var loaderContent = loader.loader;
        var loaders = Array.isArray(loaderContent) ? loaderContent : loaderContent.split('!');
        var tmpdir = __hiipack__.tmpdir;
        var installed = false;
        // 需要安装的package
        var loadersName = loaders.map(function(name){
            var _name = name.split('?')[0];
            if(_name.indexOf('-loader') === -1){
                _name += '-loader';
            }

            var exists = pkg.checkIfPackageExist(_name);

            if(exists){
                return ''
            }else{
                return _name
            }
        });

        loadersName = loadersName.join(' ').trim();

        // 如果需要安装的模块不为空, 安装相应的模块
        if(loadersName !== ''){
            installed = pkg.installPackageAndDependencies(loadersName, 'loader')
        }

        return installed
    },

    extendCustomConfig: function(root, userConfig, config){
        var customConfig = {
            // babel: "",
            library: "",
            // entry: "",
            alias: "",
            loaders: "",
            plugins: "",
            autoTest: ""
        };

        for(var key in userConfig){
            if(!(key in customConfig)){
                config[key] = userConfig[key]
            }
        }

        return config;
    },

    getProjectTMPDIR: function(root){
        var projectName = root.replace(/\/$/, '').split('/').pop();
        var tmpDir = __hii__.codeTmpdir + '/' + projectName;

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    },
    
    fixAlias: function(alias){
        for(var key in alias){
            alias[key] = alias[key].replace(/\/$/, '')
        }

        return alias
    },

    getBabelLoader: function(userConfig, env){
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
                cacheDirectory: true,
                presets: (presets).map(__hii__.resolve),
                plugins: (plugins).map(__hii__.resolve)
            }
        }
    }
};