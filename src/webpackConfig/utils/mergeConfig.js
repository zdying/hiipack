/**
 * @file
 * @author zdying
 */

var CopyWebpackPlugin = require('copy-webpack-plugin');

var merge = require('./../../helpers/merge');
var utils = require('../../helpers/utils');

var parseLoaders = require('./parseLoaders');
var parsePlugins = require('./parsePlugins');

var webpack = require('webpack');
var path = require('path');

module.exports = function mergeConfig(config, userConfig, env, root){
    var args = [].slice.call(arguments, 0);

    // 把用户配置中正常配置字段merge到config中
    config = mergeBaseConfig.apply(this, args);

    // 把扩展配置字段追加到config
    config = mergePluginsAndLoaders.apply(this, args);

    delete config.extend;
    delete config.env;
    delete config.module.preLoaders;
    delete config.module.loaders;
    delete config.module.postLoaders;


    return config
};

function mergeBaseConfig(config, userConfig, env, root){
    var specialFields = {
        // babel: "",
        library: "",
        // entry: "",
        alias: "",
        // loaders: "",
        // plugins: "",
        autoTest: ""
    };

    for(var key in userConfig){
        // 只要不是特殊字段，就merge，即使值为null/undefined
        if(!(key in specialFields)){
            config[key] = userConfig[key]
        }
    }

    return config;
}

function mergePluginsAndLoaders(config, userConfig, env, root){
    var extendFields = userConfig.extend;
    var loaders = [], plugins = [];

    var dllplugin = getDllPlugin(root, userConfig);
    var copyplugin = getCopyWebpackPlugin(root, userConfig);

    dllplugin && plugins.push(dllplugin);
    copyplugin && plugins.push(copyplugin);

    if(extendFields){
        if(extendFields.module && extendFields.module.rules){
            loaders = loaders.concat(extendFields.module.rules);
        }

        if(extendFields.module && extendFields.module.preLoaders) {
            loaders = loaders.concat(parseLoaders(userConfig.extend.module.preLoaders, 'pre'));
        }
        if(extendFields.module && extendFields.module.postLoaders) {
            loaders = loaders.concat(parseLoaders(userConfig.extend.module.postLoaders, 'post'));
        }
        if(extendFields.module && extendFields.module.loaders){
            loaders = loaders.concat(parseLoaders(userConfig.extend.module.loaders));
        }
            
        extendFields.module.rules = loaders;

        if(extendFields.plugins){
            plugins = plugins.concat(parsePlugins(userConfig.extend.plugins));
        }
        extendFields.plugins = plugins;


        if(plugins || loaders){
            config = merge(true, config, extendFields);
        }
    }else{
        config = merge(true, config, {
            plugins: plugins
        })
    }

    return config
}

function getDllPlugin(root, userConfig){
    var library = userConfig.library;
    var projTmp = utils.getProjectTMPDIR(root);
    if(library && Object.keys(library).length > 0){
        //TODO 遍历`dll`目录中的文件,添加`manifest.json`
        log.debug('webpackConfig -', 'use dll file', projTmp + "/dll/lib-manifest.json");
        return new webpack.DllReferencePlugin({
            context: root,
            manifest: require(path.join(projTmp, "/dll/lib-manifest.json"))
        })
    }
}

function getCopyWebpackPlugin(root, userConfig){
    var statics = userConfig.statics;
    if(statics){
        if(!Array.isArray(statics)){
            statics = [statics];
        }
        return new CopyWebpackPlugin(statics)
    }
}