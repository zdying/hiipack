/**
 * @file
 * @author zdying
 */
var express = require('express');
var colors = require('colors');
var path = require('path');
var fs = require('fs');
// var open = require("open");

var logger = log.namespace('Server');
var Compiler = require('../compiler');
var ProxyServer = require('../proxy');

var clients = {};
var clientId = 0;

var docSVG = fs.readFileSync(path.resolve(__dirname, 'source', 'image', 'Document.svg'));
var fileSVG = fs.readFileSync(path.resolve(__dirname, 'source', 'image', 'File.svg'));
var folderSVG = fs.readFileSync(path.resolve(__dirname, 'source', 'image', 'Folder.svg'));

function Server(port, openBrowser, proxy){
    this.app = express();
    this.compilers = {};
    this.proxyServer = null;
    this.proxy = proxy;


    this.app.all('*', function(req, res, next){
        req.url = req.url.replace(/[\?\#].*$/, '');
        req._startTime = Date.now();
        logger.debug('request -', req.url);
        next();
    });

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
        // var filePath = path.resolve('.' + url);
        var filePath = __hii__.cwd + url;
        var projInfo = this.getProjectInfoFromURL(url);

        logger.debug('projInfo:' + JSON.stringify(projInfo));

        if(projInfo){
            var projectName = projInfo.projectName;
            var fileExt = projInfo.fileExt;
            var env = projInfo.env;
            var compiler = this.compilers[projectName];

            // 第一次请求这个项目，新建一个compiler
            if(!compiler){
                compiler = this.compilers[projectName] = new Compiler(projectName);
            }

            if(fileExt === 'scss'){
                // 编译sass文件
                return compiler.compileSASS(filePath, function(err, css, time, result){
                    if(err){
                        res.statusCode = 500;
                        res.end(err.stack || err.message)
                    }else{
                        res.setHeader('Content-Type', 'text/css');
                        res.end(css);
                        logger.debug('*.sass', '-', filePath.bold, 'compiled', (time + 'ms').magenta);
                    }
                    logger.access(req);
                });
            }else if(fileExt === 'js'){
                if(env === 'prd'/* || req.url.indexOf('hot-update.js') !== -1*/){
                    return compiler.compile('loc', function(){
                        this.sendCompiledFile(req, projInfo)
                    }.bind(this))
                }else if(env === 'dev'){
                    filePath = filePath.replace(/@(\w+)\.(\w+)/, '@dev.$2');

                    logger.debug(req.url, '==>', filePath);

                    if(fs.statSync(filePath).isFile()){
                        this.sendFile(req, filePath)
                    }
                }else if(env === 'src' || env === 'loc'){
                    this.sendFile(req)
                }
            }else if(fileExt === 'css'){
                if(fs.existsSync(filePath)){
                    this.sendFile(req, filePath);
                }else{
                    return compiler.compile('loc', function(){
                        this.sendCompiledFile(req, projInfo)
                    }.bind(this));
                    // var userConfig = require(path.resolve(__hii__.cwd, projInfo.projectName, 'hii.config.js'));
                    // var entry = userConfig.entry;
                    // var entries = Object.keys(entry);
                    //
                    // if(entries.indexOf(projInfo.fileName) !== -1){
                    //     // 处理css文件
                    //     res.setHeader('Content-Type', 'text/css');
                    //     logger.debug('css -', filePath.bold, 'replaced');
                    //     res.end('/* The `css` code in development environment has been moved to the `js` file */');
                    //     logger.access(req);
                    // }else{
                    //     // will return 404
                    //     this.sendFile(req, filePath);
                    // }
                }
            }else{
                // 其它文件
                filePath = filePath.replace(/\/prd\//, '/src/');

                logger.debug(req.url, '==>', filePath);
                try{
                    if(fs.statSync(filePath).isFile()){
                        this.sendFile(req, filePath)
                    }
                }catch(e){
                    res.statusCode = 404;
                    res.end('404 Not Found');
                    logger.error(e);
                    logger.access(req);
                }
            }
        }else{
            try{
                var stat = fs.statSync(filePath);
                if(stat.isDirectory()){
                    fs.readdir(filePath, function(err, files){
                        if(err){
                            logger.error(err);
                        }else{
                            res.setHeader('Content-Type', 'text/html');

                            var html = [
                                '<header>',
                                    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">',
                                '</header>',
                                '<style>',
                                    'ul{ padding: 0; font-family: monospace; font-size: 14px; }',
                                    'li{ list-style: none; margin: 5px; width: 195px; display: inline-block; color: #0077DD; }',
                                    'li:hover{ color: #FF5522; }',
                                    'a { padding: 15px 5px; display: block; color: #0077DD; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
                                    'a:hover { color: #FF5522 }',
                                    'svg{ width: 36px; height: 36px; vertical-align: middle; margin: 0 10px 0 0; }',
                                '</style>',
                                '<ul>'
                            ];
                            html.push('<li>');
                            html.push(      '<a href="', url.replace(/\/([^\/]*?)\/?$/, '/') , '">', folderSVG, '../</a>');
                            html.push('</li>');
                            var filesItem = files.map(function(fileName){
                                if(fileName.slice(0, 1) === '.'){
                                    logger.debug('hide system file/directory', fileName.bold);
                                    // 不显示系统隐藏文件
                                    return
                                }

                                var isFile = fs.statSync(filePath + '/' + fileName).isFile();

                                return [
                                    '<li>',
                                        '<a title="' + fileName + '" href="' + (isFile ? fileName : fileName + '/') + '">',
                                            isFile ? (fileName.indexOf('.') === -1 ? fileSVG : docSVG) : folderSVG,
                                            fileName,
                                        '</a>',
                                    '</li>'
                                ].join('')
                            });

                            html.push.apply(html, filesItem);
                            html.push('</ul>');
                        }

                        res.end(html.join(''));

                        logger.access(req);
                    });
                }else{
                    this.sendFile(req)
                }
            }catch(e){
                res.statusCode = 404;
                res.end('404 Not Found');

                logger.error(e);
                logger.access(req);
            }
        }
    }.bind(this));

    var server = this.app.listen(port);

    server.on('error', function(err){
        if(err.code === 'EADDRINUSE'){
            console.log('port', String(port).bold.yellow, 'is already in use.');
            server.close();
        }else{
            console.log(err.message);
        }
    });

    server.on('listening', function(){
        var url = 'http://127.0.0.1:' + port;
        // openBrowser && open(url);

        if(openBrowser){
            // Firefox pac set
            // http://www.indexdata.com/connector-platform/enginedoc/proxy-auto.html
            // http://kb.mozillazine.org/Network.proxy.autoconfig_url
            // user_pref("network.proxy.autoconfig_url", "http://us2.indexdata.com:9005/id/cf.pac");
            // user_pref("network.proxy.type", 2);
            var chromePath = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
            var dataDir = __hii__.tmpdir;
            var command = chromePath + ' --proxy-pac-url="file://' + path.resolve(__dirname, '..', 'proxy', 'pac', 'hiipack.pac') + '"  --user-data-dir='+ dataDir +'  --lang=local  ' + url;
            // var command = chromePath + ' --proxy-server="http://127.0.0.1:' + 4936 + '"  --user-data-dir='+ dataDir +'  --lang=local  ' + url;
            log.debug('open ==> ', command);
            require('child_process').exec(command, function(err){
                if(err){
                    console.log(err);
                }
            });
        }

        console.log();
        console.log('current workspace ', __hiipack__.cwd.green.bold);
        console.log('hiipack started at', url.green.bold);

        if(this.proxy){
            // 启动代理服务
            this.proxyServer = new ProxyServer();
            this.proxyServer.start(4936);
        }

        setTimeout(function(){
            log.debug('__hii__', '-',  JSON.stringify(__hiipack__));
        }, 200)
    }.bind(this));

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
        filePath = filePath || __hii__.cwd + req.url;

        logger.debug('send file: ' + filePath.bold);

        var res = req.res;

        res.sendFile(filePath, function(err){
            if(err){
                res.statusCode = 404;
                res.end('404 Not Found');
                logger.error(err);
            }
            logger.access(req);
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

    sendCompiledFile: function(req, projInfo){
        var filePath = __hii__.codeTmpdir + req.url;
        filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1').replace(/\/prd\//, '/loc/');
        this.sendFile(req, filePath);
        // var content = mfs.readFileSync(filePath)//.toString();
        // req.res.setHeader('Content-Type', 'text/javascript');
        // req.res.setHeader('Content-Length', content.length);
        // req.res.send(content)
    }
};

// function publish(data){
//     for(var id in clients){
//         clients[id].write("data: " + JSON.stringify(data) + "\n\n");
//     }
// }
//
// function buildModuleMap(modules){
//     var map = {};
//     modules.forEach(function(module){
//         map[module.id] = module.name;
//     });
//     return map;
// }

module.exports = Server;