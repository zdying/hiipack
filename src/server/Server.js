/**
 * @file
 * @author zdying
 */
var express = require('express');
var colors = require('colors');
var path = require('path');
var fs = require('fs');
var open = require("open");

var log = require('../helpers/log');
var Compiler = require('./Compiler');

var clients = {};
var clientId = 0;

function Server(port, openBrowser){
    this.app = express();
    this.compiler = new Compiler();

    // this.app.get('*', function(req, res, next){
    //     // console.log('[access]'.green, req.method, req.url);
    //     log.access(req);
    //     next();
    // });

    // this.app.get('/__webpack_hmr', function(req, res, next){
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
    
    this.app.get('/favicon.ico', function(req, res, next){
        this.sendFile(req, __dirname + '/source/favicon.ico');
    }.bind(this));

    this.app.all('*', function(req, res, next){
        var url = req.url;
        var projInfo = this.getProjectInfoFromURL(url);
        var compiler = this.compiler;

        // console.log('');
        // console.log(logPrex, '[access]', req.method.bold, url);

        log.debug('projInfo:' + JSON.stringify(projInfo));

        if(projInfo){
            var fileExt = projInfo.fileExt;
            var env = projInfo.env;

            if(fileExt === 'scss'){
                // 编译sass文件
                return compiler.compileSass(req, projInfo)
            }else if(fileExt === 'js'){
                if(env === 'prd' || req.url.indexOf('hot-update.js') !== -1){
                    return compiler.compileJS(req, projInfo,  this.sendCompiledFile.bind(this))
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
                    res.end('404 Not Found');
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
                            html.push('<li><a href="', url.replace(/\/([^\/]*?)\/?$/, '/') , '">../</a></li>');
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
                res.end('404 Not Found');

                log.error(e);
                log.access(req);
            }
        }
    }.bind(this));

    var server = this.app.listen(port);

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
        console.log('\b\b  ');
        console.log('Bye Bye.'.bold.yellow);
        process.exit()
    });

    process.on('SIGTERM', function(){
        console.log('Bye Bye.'.bold.yellow);
        process.exit()
    });
}

Server.prototype = {
    constructor: Server,
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
                res.end('404 Not Found');
                log.error(err);
            }
            log.access(req);
        });
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

    sendCompiledFile: function(req, projInfo, webpackCompiler){
        var filePath = path.resolve('.' + req.url);
        filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1').replace(/\/prd\//, '/loc/');
        this.sendFile(req, filePath)
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

module.exports = Server;