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
var type = require('../helpers/type');

var configWatchers = {};

function Compiler(projectName, root, env){
    this.isCompiling = false;
    this.projectName = projectName;
    this.root = root || path.resolve('./' + projectName);
    this.webpackCompiler = null;
    this.watching = null;
    this.env = env;
    this.configFileChanged = false;

    if(env === 'loc'){
        this.watchConfigFile(this.onConfigFileChange.bind(this));
    }

    logger.debug('create new compiler', projectName.bold.green, 'env', env.bold.green);
}

Compiler.prototype = {
    constructor: Compiler,

    _compile: function(isDLL, isWatch, option, callback){
        var cbk = function(err, state){
            callback && callback(err, state);
        };

        if(this.watching && this.watching.close){
            this.watching.close(function(){
                logger.debug('watching closed.');
            });
        }

        var compiler = this.webpackCompiler = this._getWebpackCompiler(isDLL, option);

        if(!compiler){
            var err = new Error();
            err.code = "COMPILER_NULL";
            return cbk(err, null)
        }

        if(isWatch){
            // logger.info('watching ...');
            return this.watching = compiler.watch({}, cbk);
        }else{
            // logger.info('run ... ');
            return compiler.run(cbk);
        }
    },

    compile: function(option, callback){
        log.debug('compiler.compile() - ', this.env);

        if(arguments.length === 1){
            callback = option;
            option = {
                watch: true
            };
        }
        var isWatch = option.watch;

        if(this.webpackCompiler === null || this.configFileChanged){

            if(this.configFileChanged){
                this.configFileChanged = false;
            }

            log.debug('compiler.compile() - ', 'create new webpack compiler instance.');
            // 编译dll
            this._compile(true, isWatch, {}, function(){
                // 编译其他代码
                this._compile(false, isWatch, option);
            }.bind(this));
        }else{
            // 已经创建过实力
            log.debug('compiler.compile() - ', 'use old webpack compiler instance.');
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

    compileDLL: function(isWatch, option, cbk){
        this._compile(true, isWatch, option, cbk)
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

    _getWebpackCompiler: function(isDLL, option){
        var config = this._getConfig(isDLL, option);
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

                    if(self.env === 'loc'){
                        publish({
                            action: "building"
                        });
                    }
                }
            ].concat(optPlugins.compile || []),
            'done': [
                function(statsResult){
                    var hasError = statsResult.hasErrors();
                    self.isCompiling = false;
                    process.chdir(__hii__.cwd);

                    logger.info('#' + statsResult.hash, 'compile finished (', (statsResult.endTime - statsResult.startTime) + 'ms', ')');

                    if(hasError || program.detail){
                        console.log('compile result: \n' + statsResult.toString({
                            colors: program.color,
                            timings: true,
                            chunks: true,
                            children: true
                        }));
                    }

                    if(self.env === 'loc'){
                        var stats = statsResult.toJson();
                        var arr = [stats];

                        if(Array.isArray(stats.children) && stats.children.length){
                            arr = stats.children
                        }

                        arr.forEach(function (stats) {
                            publish({
                                name: stats.name,
                                action: "built",
                                time: stats.time,
                                hash: stats.hash,
                                warnings: stats.warnings || [],
                                errors: stats.errors || [],
                                modules: buildModuleMap(stats.modules)
                            });
                        });
                    }
                }
            ].concat(optPlugins.done || [])
        };

        var compiler = webpack(config);

        logger.debug('new webpack compiler created.');

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

    getWebpackCompiler: function(option){
        return this._getWebpackCompiler(false, option)
    },

    getWebpackDLLCompiler: function(option){
        return this._getWebpackCompiler(true, option)
    },

    _getConfig: function(isDLL, option){
        var env = this.env;
        var root = this.root;
        var userConfigPath = path.join(root, 'hii.config.js');
        var webpackConfigPath = path.join(root, 'webpack.config.js');
        // var userConfig = null;
        var fixedEnv = env.slice(0, 1).toUpperCase() + env.slice(1);
        var dllName = isDLL ? 'DLL' : '';
        var method= 'get' + fixedEnv + dllName + 'Config';

        var hasHiipackConfig = fs.existsSync(userConfigPath);
        var hasWebpackConfig = fs.existsSync(webpackConfigPath);

        if(!/^(loc|dev|prd)$/.test(env)){
            logger.error('invalid param', '`env`'.bold.yellow, 'env should be one of loc/dev/prd.');
            return null
        }

        if(!hasHiipackConfig && !hasWebpackConfig){
            // logger.error('Compiler -', this.projectName.bold.yellow, "is not an valid hiipack project,", '`hii.config.js`'.bold.green, 'not exists.');
            logger.error('Compiler -', this.projectName.bold.yellow, "is not an valid hiipack project or webpack project, the", '`hii.config.js`'.bold.green, 'or', '`webpack.config.js`'.bold.green, 'is required')
            return null
        }

        if(hasHiipackConfig){
            var userConfig = configUtil.getUserConfig(root, env);

            // userConfig = require(userConfigPath);

            if(isDLL && Object.keys(userConfig.library || {}).length === 0){
                logger.debug('Compiler -', this.projectName.bold.yellow, "has no third party library.");
                return null
            }

            logger.debug('call method', method.bold.magenta);

            // delete require cache
            // delete require.cache[require.resolve(userConfigPath)];
            var config = configUtil[method](root, userConfig);
        }else{
            var config = require(webpackConfigPath);
        }

        logger.detail('user config', '==>',
            JSON.stringify(config, function(key, value){
                var valType = type(value);
                if(valType.match(/(function|regexp)/)){
                    return value.toString()
                }
                return value
            })
        );

        return config;
    },

    onConfigFileChange: function(){
        this.configFileChanged = true;
    },

    getConfig: function(){
        return this._getConfig();
    },

    getDLLConfig: function(){
        return this._getConfig(true)
    },

    watchConfigFile: function(cbk){
        var configPath = path.join(this.root, 'hii.config.js');
        var projectName = this.projectName;

        if(configWatchers[projectName] !== true){
            // 记录一下已经watch的文件， 避免多次watch
            configWatchers[projectName] = true;

            logger.info('watch config file', configPath.bold.green);

            fs.watchFile(configPath, {interval: 2000}, function(curr, prev){
                if(curr.mtime !== prev.mtime){
                    // 清除require缓存
                    delete require.cache[configPath];
                    logger.info(
                        'config file changed:', configPath.bold.green.bold
                    );
                    cbk && cbk(curr, prev);
                }
            }.bind(this))
        }
    }
};

module.exports = Compiler;

function publish(data) {
    for (var id in global.clients) {
        global.clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}

function buildModuleMap(modules) {
    var map = {};
    modules.forEach(function (module) {
        map[module.id] = module.name;
    });
    return map;
}