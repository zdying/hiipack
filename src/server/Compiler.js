/**
 * @file
 * @author zdying
 */
var webpack = require('webpack');
var path = require('path');

var configUtil = require('../webpackConfig');
var log = require('../helpers/log');

var watchings = {};

function Compiler(){
    this.isCompiling = false;
}

Compiler.prototype = {
    constructor: Compiler,
    /**
     * 编译sass文件
     * @param req
     * @param projInfo
     */
    compileSass: function(req, projInfo){
        ////////////////////////////////
        // sass file
        ////////////////////////////////
        var url = req.url;
        var res = req.res;
        var sass = require('node-sass');
        var fileName = url.replace(/\/prd\//, '/src/');
        var start = Date.now();

        sass.render({
                file: '.' + fileName
            },
            function(err, result){
                if(err){
                    res.statusCode = 500;
                    res.end(err.stack || err.message)
                }else{
                    res.setHeader('Content-Type', 'text/css');
                    res.end(result.css.toString());
                    log.debug('*.sass', '-', url.bold, '==>', fileName.bold, (Date.now() - start + 'ms').magenta);
                }
                log.access(req);
            }
        );
    },
    /**
     * 编译JavaScript文件
     * @param req
     * @param projInfo
     * @param callback
     */
    compileJS: function(req, projInfo, callback){
        //TODO 处理: 编译完后,手动删除编译后的目录后找不到文件
        if(!watchings[projInfo.projectName]){
            watchings[projInfo.projectName] = true;
            var self = this;
            this.createDLLCompiler(req, projInfo, function(){
                self.createCompiler(req, projInfo);
            });
        }

        // compiler.run(function (err, state) {
        //     if(err){
        //         console.log('[error]'.bold.red, 'compiler run failed.');
        //         console.log(err.stack);
        //         res.statusCode = 500;
        //         res.end(req.url + ' Error.');
        //         // res.end(err.stack);
        //     }else{
        //         // send compiled file
        //         var filePath = path.resolve('.' + req.url);
        //         filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1');
        //         this.sendFile(req, filePath, 'loc')
        //     }
        // }.bind(this));

        var self = this;

        if(this.isCompiling !== true){
            // send compiled file
            callback(req, projInfo, watchings[projInfo.projectName])
        }else{
            log.info('wait until compilation is complete ...'.bold);
            var a = setInterval(function(){
                if(this.isCompiling === false){
                    callback(req, projInfo, watchings[projInfo.projectName]);
                    clearInterval(a);
                }
            }.bind(this), 100);
        }
    },
    createCompiler: function(req, projInfo){
        // var res = req.res;
        var root = path.resolve('./' + projInfo.projectName);
        // var configPath = root + '/env/webpack.config.development.js';
        var userConfigPath = root + '/config.js';

        // delete require cache
        // delete require.cache[require.resolve(userConfigPath)];
        var config = configUtil.getLocConfig(root, require(userConfigPath));

        // es2015-loose relative.resolve() bug:
        // 没有指定relativeTo, 所以默认采用`process.cwd()`
        // 而`process.cwd()`的值是当前的工作目录, 不是`hiipack`的跟目录
        var oldCwd = process.cwd();

        process.chdir(__hiipack__.root);

        // var entry = config.entry;
        // var hotURL = require.resolve('webpack-hot-middleware/client');
        //
        // for(var key in entry){
        //     var _entry = entry[key];
        //     if(Array.isArray(_entry)){
        //         _entry.indexOf(hotURL) === -1 && _entry.unshift(hotURL)
        //     }else{
        //         entry[key] = [hotURL, _entry];
        //     }
        // }
        //
        // config.plugins.push(
        //     new webpack.optimize.OccurrenceOrderPlugin(),
        //     new webpack.HotModuleReplacementPlugin()
        // );

        var compiler = webpack(config);

        compiler.plugin("compile", function(){
            this.isCompiling = true;
            log.info('compiling [', Object.keys(config.entry).join('.js, ') + '.js', ']');
            // publish({
            //     action: "building"
            // });
        }.bind(this));

        compiler.plugin("done", function(statsResult){
            this.isCompiling = false;
            var stats = statsResult.toJson();

            process.chdir(oldCwd);

            log.info('compile', '-', 'compile finished (', (statsResult.endTime - statsResult.startTime) + 'ms', ')');
            log.debug('compile result: \n' + statsResult.toString({
                    colors: false,
                    timings: true,
                    chunks: false,
                    children: false
                }));

            // (stats.children || [stats]).forEach(function(stats){
            //     publish({
            //         name: stats.name,
            //         action: "built",
            //         time: stats.time,
            //         hash: stats.hash,
            //         warnings: stats.warnings || [],
            //         errors: stats.errors || [],
            //         modules: buildModuleMap(stats.modules)
            //     });
            // });
        }.bind(this));

        var watching = compiler.watch({}, function(err, state){
            // if (err) {
            //     console.log(errPrex, 'compiler run failed.');
            //     console.log(err.stack);
            // } else {
            //     console.log('build finish.');
            // }
        });
        watchings[projInfo.projectName] = watching;
    },

    createDLLCompiler: function(req, projInfo, cbk){
        var root = path.resolve('./' + projInfo.projectName);
        //TODO userConfig 可以直接作为参数传进去
        var userConfig = require(root + '/config');

        if(!userConfig.library || Object.keys(userConfig.library).length === 0){
            cbk && cbk();
            return
        }

        var dllConfig = configUtil.getLocDLLConfig(root);

        var compiler = webpack(dllConfig);

        compiler.plugin("compile", function(){
            this.isCompiling = true;
            log.info('compiling [', Object.keys(dllConfig.entry).join('.js, ') + '.js', ']');
            // publish({
            //     action: "building"
            // });
        }.bind(this));

        compiler.run(function(err, state){
            if(err){
                log.error(err);
            }else{
                log.info('library build finish');
                cbk && cbk(state)
            }
        });
    }
};

module.exports = Compiler;