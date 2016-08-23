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
        var projTmp = this.getProjectTMPDIR(root);
        if(library && Object.keys(library).length > 0){
            //TODO 遍历`dll`目录中的文件,添加`manifest.json`
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
        var self = this;

        if(!customLoaders || Object.keys(customLoaders).length === 0){
            return arr
        }

        userLoaders = (userConfig.loaders[env] || []).concat(userConfig.loaders['*'] || []);

        userLoaders.forEach(function(loader, index){
            if(loader.loader){
                // 直接使用loader
                self.installLoader(loader);
                arr.push(loader);
            }else{
                // 先安装,然后设置
                for(var pkgs in loader){
                    var currLoader = loader[pkgs];
                    var currLoaderType = typeof currLoader;
                    var loaderResult = null;
                    var installed =  pkg.installPackage(pkgs, 'loader');

                    if(installed){
                        pkg.installDependencies(pkgs, 'peerDependencies')
                    }

                    if(currLoaderType === 'function'){
                        var params = pkgs.split(' ').map(function(pkgName){
                            return pkg.getPackagePath(pkgName);
                        });
                        var modules = params.map(function(p){
                            return require(p)
                        });
                        log.debug('call loader config callback ...');
                        loaderResult = currLoader.apply(null, modules.concat(params));
                        log.debug('loader config callback result:', JSON.stringify(loaderResult));
                    }else if(currLoaderType === 'object' && currLoader !== null){
                        log.debug('loader config is object:', JSON.stringify(loaderResult));
                        loaderResult = currLoader
                    }

                    self.installLoader(loaderResult);

                    arr.push(loaderResult)
                }
            }
        });

        return arr
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
            installed = pkg.installPackage(loadersName, 'loader');

            if(installed){
                pkg.installDependencies(loadersName, 'peerDependencies')
            }
        }

        return installed
    },

    extendCustomConfig: function(root, userConfig, config){
        var customConfig = {
            library: "",
            entry: "",
            alias: "",
            loaders: "",
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
        var tmpDir = __hii__.tmpdir + '/' + projectName;

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    }
};