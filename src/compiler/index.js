/**
 * @file
 * @author zdying
 */

var configUtil = require('../webpackConfig');

var webpack = require('webpack');
var colors = require('colors');
var path = require('path');
var fs = require('fs');

var logger = log.namespace('Compiler');

function Compiler(projectName, root){
    this.isCompiling = false;
    this.projectName = projectName;
    this.root = root || path.resolve('./' + projectName);
    this.webpackCompiler = null;

    logger.debug('create new compiler', projectName.bold.green);
}

Compiler.prototype = {
    constructor: Compiler,
    _compile: function(env, isDLL, isWatch, option, callback){
        var cbk = function(err, state){
            callback && callback(err, state);
        };

        var compiler = this.webpackCompiler = this._getWebpackCompiler(env, isDLL, option);

        if(!compiler){
            var err = new Error();
            err.code = "COMPILER_NULL";
            return cbk(err, null)
        }

        if(isWatch){
            return this.watching = compiler.watch({}, cbk);
        }else{
            return compiler.run(cbk);
        }
    },
    compile: function(env, option, callback){
        if(arguments.length === 2){
            callback = option;
            option = {
                watch: true
            };
        }
        var isWatch = option.watch;

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
                    callback && callback();
                    clearInterval(a);
                }
            }.bind(this), 100);
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
                    logger.info('compiling [', (Object.keys(config.entry).join('.js, ') + '.js').bold.magenta, '] ...');
                }
            ].concat(optPlugins.compile || []),
            'done': [
                function(statsResult){
                    var hasError = statsResult.hasErrors();
                    self.isCompiling = false;
                    process.chdir(__hii__.cwd);
                    logger.info('compile finished (', (statsResult.endTime - statsResult.startTime) + 'ms', ')');
                    if(hasError || program.detail){
                        console.log('compile result: \n' + statsResult.toString({
                            colors: true,
                            timings: true,
                            chunks: true,
                            children: true
                        }));
                    }
                }
            ].concat(optPlugins.done || [])
        };

        var compiler = webpack(config);

        // 添加插件
        for(var pluginName in plugins){
            plugins[pluginName].forEach(function(fn){
                logger.debug('add webpack compiler plugin', pluginName.bold.green);
                compiler.plugin(pluginName, fn);
            });
        }

        // if(env === 'loc'/* && !isDLL*/){
        //     console.log(mfs);
        //     compiler.outputFileSystem = mfs;
        // }

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
        var userConfig = null;
        var fixedEnv = env.slice(0, 1).toUpperCase() + env.slice(1);
        var dllName = isDLL ? 'DLL' : '';
        var method= 'get' + fixedEnv + dllName + 'Config';

        if(!/^(loc|dev|prd)$/.test(env)){
            logger.error('invalid param', '`env`'.bold.yellow, 'env should be one of loc/dev/prd.');
            return null
        }

        if(!fs.existsSync(userConfigPath)){
            logger.error('Compiler -', this.projectName.bold.yellow, "is not an valid hiipack project,", '`config.js`'.bold.green, 'not exists.');
            return null
        }

        userConfig = require(userConfigPath);

        if(isDLL && Object.keys(userConfig.library || {}).length === 0){
            logger.debug('Compiler -', this.projectName.bold.yellow, "has no third party library.");
            return null
        }

        logger.debug('call method', method.bold.magenta);

        // delete require cache
        // delete require.cache[require.resolve(userConfigPath)];
        var config = configUtil[method](root, userConfig);

        logger.detail('user config', '==>', JSON.stringify(config));

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