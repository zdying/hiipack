/**
 * @file
 * @author zdying
 */

'use strict';

var webpack = require('webpack');
var express = require('express');
var colors = require('colors');
var path = require('path');
var fs = require('fs');
var open = require("open");

var configUtil = require('../webpackConfig');
var log = require('../helpers/log');

var watchings = {};
var clients = {};
var clientId = 0;

module.exports = {
    init: function(){

    },

    isCompiling: false,

    /**
     * 启动一个服务
     */
    start: function(port, openBrowser){
        var app = express();

        // app.get('*', function(req, res, next){
        //     // console.log('[access]'.green, req.method, req.url);
        //     log.access(req);
        //     next();
        // });

        // app.get('/__webpack_hmr', function(req, res, next){
        //     req.socket.setKeepAlive(true);
        //     res.writeHead(200, {
        //         'Access-Control-Allow-Origin': '*',
        //         'Content-Type': 'text/event-stream;charset=utf-8',
        //         'Transfer-Encoding': 'chunked',
        //         'Cache-Control': 'no-cache, no-transform',
        //         'Connection': 'keep-alive'
        //     });
        //     res.write('\n');
        //     var id = clientId++;
        //     clients[id] = res;
        //     req.on("close", function(){
        //         delete clients[id];
        //     });
        //
        //     setInterval(function(){
        //         res.write("data: \uD83D\uDC93\n\n");
        //     }, 2000)
        // });

        app.get('*', function(req, res, next){
            var url = req.url;
            var projInfo = this.getProjectInfoFromURL(url);

            // console.log('');
            // console.log(logPrex, '[access]', req.method.bold, url);

            log.debug('projInfo:' + JSON.stringify(projInfo));

            if(projInfo){
                var fileExt = projInfo.fileExt;
                var version = projInfo.version;
                var env = projInfo.env;

                if(fileExt === 'scss'){
                    // 编译sass文件
                    return this.compileSass(req, projInfo)
                }else if(fileExt === 'js'){
                    if(env === 'prd' || req.url.indexOf('hot-update.js') !== -1){
                        return this.compileJS(req, projInfo)
                    }else if(env === 'dev'){
                        var filePath = path.resolve('.' + req.url);
                        filePath = filePath.replace(/@(\w+)\.(\w+)/, '@dev.$2').replace(/[\?\#](.*)/, '');

                        log.debug(req.url, '==>', filePath);

                        if(fs.statSync(filePath).isFile()){
                            this.sendFile(req, filePath)
                        }

                        return
                    }else if(env === 'src' || env === 'loc'){
                        return this.sendFile(req)
                    }
                }else if(fileExt === 'css'){
                    //TODO 判断,如果文件存在, 不处理, 直接发送文件
                    // 处理css文件
                    return res.end('/* The `css` code in development environment has been moved to the `js` file */')
                }else{
                    // 其它文件
                    var filePath = path.resolve('.' + req.url);
                    filePath = filePath.replace(/\/prd\//, '/src/').replace(/[\?\#](.*)/, '');

                    log.debug(req.url, '==>', filePath);
                    try{
                        if(fs.statSync(filePath).isFile()){
                            this.sendFile(req, filePath)
                        }
                    }catch(e){
                        res.statusCode = 404;
                        res.end('404 not found.');
                        log.error(e);
                        log.access(req);
                    }
                }
            }else{
                var dir = path.resolve('.' + req.url);
                try{
                    var stat = fs.statSync(dir);
                    if(stat.isDirectory()){
                        fs.readdir(dir, function(err, files){
                            var html = [];
                            if(err){
                                log.error(err);
                            }else{
                                res.setHeader('Content-Type', 'text/html');

                                html = ['<style>li{ list-style: none; margin: 5px; display: block; }</style>', '<ul>'];
                                // html.push('<li><a href="', url.replace(/\/$/, '') , '">..</a></li>');
                                var filesItem = files.map(function(fileName, index){
                                    return '<li><a href="' + url.replace(/\/$/, '') + '/' + fileName + '">' + fileName + '</a></li>'
                                });

                                html.push.apply(html, filesItem);

                                html.push('</ul>');
                            }

                            res.end(html.join(''));

                            log.access(req);
                        });
                    }else{
                        this.sendFile(req)
                    }
                }catch(e){
                    res.statusCode = 404;
                    res.end();

                    log.error(e);
                    log.access(req);
                }
            }
        }.bind(this));

        var server = app.listen(port);

        server.on('error', function(err){
            if(err.code === 'EADDRINUSE'){
                log.error('port', String(port).bold.yellow, 'is already in use.');
                server.close();
            }else{
                log.error(err.message);
            }
        });

        server.on('listening', function(){
            var url = 'http://127.0.0.1:' + port;
            openBrowser && open(url);

            console.log();
            console.log('hiipack started at', url.magenta.bold);
            console.log('current workspace ', __hiipack__.cwd.magenta.bold);
            console.log();

            log.debug('__hii__', '-',  JSON.stringify(__hiipack__));
        });

        process.on("SIGINT", function(){
            log.info('server closed by ctrl + c');
            process.exit()
        });

        process.on('SIGTERM', function(){
            log.info('server closed by SIGTERM');
            process.exit()
        });
    },

    /**
     * 发送文件
     * @param req
     * @param filePath
     * @param env
     */
    sendFile: function(req, filePath){
        filePath = filePath || path.resolve('.' + req.url);

        log.debug('send file: ' + filePath.bold);

        var res = req.res;

        res.sendFile(filePath, function(err){
            if(err){
                res.statusCode = 404;
                res.end(req.url + ' not found.');
                log.error(err);
            }
            log.access(req);
        });
    },

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
     */
    compileJS: function(req, projInfo){
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
            send()
        }else{
            log.info('file is compiling...');
            var a = setInterval(function(){
                if(this.isCompiling === false){
                    send();
                    clearInterval(a);
                }
            }.bind(this), 100);
        }

        function send(){
            var filePath = path.resolve('.' + req.url);
            filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1').replace(/\/prd\//, '/loc/');
            self.sendFile(req, filePath)
        }
    },

    getProjectInfoFromURL: function(url){
        //  url,  projectName,    env,    folder, fileName, version, fileExt,     paramsAndHash
        var reg = /\/(.*?)\/(src|prd|loc|dev)(\/.*)?\/(.*?)(@\w+)?(?:\.(\w+))([\#\?].*)?$/;
        var result = url.match(reg);

        if(result){
            return {
                projectName: result[1],
                env: result[2],
                folder: result[3],
                fileName: result[4],
                version: result[5],
                fileExt: result[6],
                paramsAndHash: result[7]
            }
        }else{
            return null
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
            publish({
                action: "building"
            });
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
            publish({
                action: "building"
            });
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

function publish(data){
    for(var id in clients){
        clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}

function buildModuleMap(modules){
    var map = {};
    modules.forEach(function(module){
        map[module.id] = module.name;
    });
    return map;
}
