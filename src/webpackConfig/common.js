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

    extendLoaders: function(arr, root, userConfig){
        var userLoaders = (userConfig.loaders || {}).dev || [];

        userLoaders.forEach(function(loader, index){
            if(!loader.loader){
                return
            }

            var loaderContent = loader.loader;
            var loaders = Array.isArray(loaderContent) ? loaderContent : loaderContent.split('!');
            var loadersName = loaders.map(function(name){
                var _name = name.split('?')[0];
                if(_name.indexOf('-loader') === -1){
                    _name += '-loader';
                }

                try{
                    var stats = fs.statSync(__hiipack_root__ + '/node_modules/' + _name);
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
                child_process.execSync('npm install ' + loadersName.join(' '), { cwd: __hiipack_root__ });
            }

            arr.push(loader);
        });

        return arr
    }
}