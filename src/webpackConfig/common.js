/**
 * @file
 * @author zdying
 */
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var fs = require('fs');
var child_process = require('child_process');

var pkg = require('../helpers/package');

module.exports = {
    getDllPlugin: function(root, userConfig){
        var library = userConfig.library;
        if(library && Object.keys(library).length > 0){
            //TODO 遍历`dll`目录中的文件,添加`manifest.json`
            return new webpack.DllReferencePlugin({
                context: root,
                manifest: require(root + "/dll/lib-manifest.json")
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

    extendPlugins: function(arr, plugins, root, userConfig){
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
        return arr
    },

    extendLoaders: function(arr, root, userConfig, config){
        var env = config.env;
        var customLoaders = userConfig.loaders;
        var userLoaders = null;

        if(!customLoaders || Object.keys(customLoaders).length === 0){
            return arr
        }

        userLoaders = (userConfig.loaders[env] || []).concat(userConfig.loaders['*'] || []);

        userLoaders.forEach(function(loader, index){
            if(!loader.loader){
                return
            }

            var loaderContent = loader.loader;
            var loaders = Array.isArray(loaderContent) ? loaderContent : loaderContent.split('!');
            var tmpdir = __hiipack__.tmpdir;
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
                var installed = pkg.installPackage(loadersName, 'loader');

                if(installed){
                    pkg.installDependencies(loadersName, 'peerDependencies')
                }
            }

            arr.push(loader);
        });

        return arr
    },

    extendCustomConfig: function(root, userConfig, config){
        var customConfig = {
            library: "",
            entry: "",
            alias: "",
            loaders: ""
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
        var tmpDir = __hii__.tmpdir + '/' + projectName;

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    }
};