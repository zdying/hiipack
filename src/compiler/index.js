/**
 * @file
 * @author zdying
 */

var configUtil = require('../webpackConfig');

var webpack = require('webpack');
var colors = require('colors');
var path = require('path');
var fs = require('fs');

function Compiler(projectName){
    this.isCompiling = false;
    this.projectName = projectName;
    this.root = path.resolve('./' + projectName);
    this.webpackCompiler = null;

    log.debug('Compiler - create new compiler', projectName.bold.green);
}

Compiler.prototype = {
    constructor: Compiler,
    _compile: function(env, isDLL, isWatch, option, callback){
        var cbk = function(err, state){
            callback && callback();
        };

        var compiler = this.webpackCompiler = this._getWebpackCompiler(env, isDLL, option);

        if(isWatch){
            return this.watching = compiler.watch({}, cbk);
        }else{
            return compiler.run(cbk);
        }
    },
    compile: function(env, option, callback){
        if(typeof callback === 'undefined'){
            callback = option;
            option = {
                isWatch: true
            };
        }
        var isWatch = option.isWatch;

        if(this.webpackCompiler === null){
            // 编译dll
            this._compile(env, true, isWatch, {}, function(){
                // 编译其他代码
                this._compile(env, false, isWatch, option);
            }.bind(this));
        }else{
            // 已经创建过实力
        }

        if(this.isCompiling){
            var a = setInterval(function(){
                if(this.isCompiling === false){
                    // if(option.plugins && Array.isArray(option.plugins.done)){
                    //     option.plugins.done.forEach(function(fnDone){
                    //         fnDone()
                    //     })
                    // }
                    callback && callback();
                    clearInterval(a);
                }
            }.bind(this), 100);

            // var self = this;

            // if(option.plugins && Array.isArray(option.plugins.done)){
            //     option.plugins.done.forEach(function(fnDone){
            //         self.webpackCompiler.plugin('done', fnDone);
            //     })
            // }
        }else{
            callback && callback();
        }
    },
    compileDLL: function(env, isWatch, option){
        this._compile(env, true, isWatch, option)
    },
    compileSASS: function(filePath, callback){
        var sass = require('node-sass');
        var start = Date.now();
        var opt = { file: filePath };

        sass.render(opt, function(err, result){
            var time = Date.now() - start;
            callback && callback(err, result.css.toString(), time, result);
        });
    },
    compileLESS: function(filePath){
        //TODO compile less file to css
    },
    _getWebpackCompiler: function(env, isDLL, option){
        var config = this._getConfig(env, isDLL);
        var self = this;

        if(!config){
            return null
        }

        var optPlugins = option.plugins || {};
        var plugins = {
            'compile': [
                function(){
                    self.isCompiling = true;
                    // es2015-loose relative.resolve() bug:
                    // 没有指定relativeTo, 所以默认采用`process.cwd()`
                    // 而`process.cwd()`的值是当前的工作目录, 不是`hiipack`的跟目录
                    process.chdir(__hii__.root);
                    log.info('compiling [', (Object.keys(config.entry).join('.js, ') + '.js').bold.magenta, ']');
                }
            ].concat(optPlugins.compile || []),
            'done': [
                function(statsResult){
                    self.isCompiling = false;
                    process.chdir(__hii__.cwd);
                    log.info('compile', '-', 'compile finished (', (statsResult.endTime - statsResult.startTime) + 'ms', ')');
                    log.debug('compile result: \n' + statsResult.toString({
                        colors: false,
                        timings: true,
                        chunks: false,
                        children: false
                    }));
                }
            ].concat(optPlugins.done || [])
        };

        var compiler = webpack(config);

        // 添加插件
        for(var pluginName in plugins){
            plugins[pluginName].forEach(function(fn){
                log.debug('compile - add webpack compiler plugin', pluginName.bold.green);
                compiler.plugin(pluginName, fn);
            });
        }

        return compiler
    },
    getWebpackCompiler: function(env, option){
        return this._getWebpackCompiler(env, false, option)
    },
    getWebpackDLLCompiler: function(env, option){
        return this._getWebpackCompiler(env, true, option)
    },
    _getConfig: function(env, isDLL){
        var root = this.root;
        var userConfigPath = root + '/config.js';
        var fixedEnv = env.slice(0, 1).toUpperCase() + env.slice(1);
        var dllName = isDLL ? 'DLL' : '';
        var method= 'get' + fixedEnv + dllName + 'Config';

        if(!/^(loc|dev|prd)$/.test(env)){
            log.err('invalid param', '`env`'.bold.yellow, 'env should be one of loc/dev/prd.');
            return null
        }

        if(!fs.existsSync(userConfigPath)){
            log.err(this.projectName.bold.yellow, "is not an valid hiipack project,", '`config.js`'.bold.green, 'not exists.');
            return null
        }

        log.debug('Compiler - call method', method.bold.magenta);

        // delete require cache
        // delete require.cache[require.resolve(userConfigPath)];
        var config = configUtil[method](root, require(userConfigPath));

        // log.debug('Compiler - user config', '==>', JSON.stringify(config));

        return config;
    },
    getConfig: function(env){
        return this._getConfig(env);
    },
    getDLLConfig: function(env){
        return this._getConfig(env, true)
    }
};

module.exports = Compiler;