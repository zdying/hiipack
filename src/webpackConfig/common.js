/**
 * @file
 * @author zdying
 */
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var fs = require('fs');
var child_process = require('child_process');

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
            console.log('[error]'.red, 'invalid param', 'plugins'.bold.yellow);
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
            var loadersName = loaders.map(function(name){
                var _name = name.split('?')[0];
                if(_name.indexOf('-loader') === -1){
                    _name += '-loader';
                }

                try{
                    var stats = fs.statSync(tmpdir + '/node_modules/' + _name);
                    if (stats.isDirectory()) {
                        console.log('[info]'.green, 'loader', _name.bold.green, 'is already exists.');
                    }
                    return ''
                }catch(e){
                    return _name
                }
            });

            // 如果需要安装的模块不为空, 安装相应的模块
            if(loadersName.join(' ').trim() !== ''){
                console.log('[install]'.green, 'install custom loader', loadersName.join(' ').bold.green);
                child_process.execSync('npm install ' + loadersName.join(' '), { cwd: tmpdir, stdio: 'ignore' });
                // child_process.execSync('npm install ' + loadersName.join(' '), { cwd: __hiipack__.root });

                // 安装peerDependencies
                loadersName.forEach(function(loader, index){
                    console.log('[install]'.green, 'find peerDependencies for', loader.green);

                    var tmpModulesPath = tmpdir + 'node_modules/';
                    var packageInfo = require(tmpModulesPath + loader + '/package.json');
                    var peerDependencies = packageInfo.peerDependencies;
                    var peerDeps = Object.keys(peerDependencies);

                    /*
                    if(peerDeps){
                        console.log('[install]'.green, loader.green, 'peerDependencies:', peerDeps.toString().green);
                        child_process.execSync('npm install --peer', { cwd: tmpModulesPath + loader });
                    }

                    config.resolve.fallback.push(tmpModulesPath + loader + '/node_modules');
                    config.resolveLoader.fallback.push(tmpModulesPath + loader + '/node_modules');
                    */

                    peerDeps.forEach(function(dep){
                        //TODO hiipack内置的依赖,不需要安装
                        try{
                            var stats = fs.statSync(tmpModulesPath + dep);
                            if (stats.isDirectory()) {
                                console.log('[info]'.green, loader, 'peerDependency', dep.bold.green, 'is already exists.');
                            }
                            return ''
                        }catch(e){
                            console.log('[install]'.green, 'install', loader, 'peerDependency', dep.bold.green);
                            try{
                                child_process.execSync('npm install ' + dep, { cwd: tmpdir, stdio: 'ignore' });
                            }catch(e){
                                // console.log('e', e.message);
                            }
                        }
                    })
                });
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
    }
};