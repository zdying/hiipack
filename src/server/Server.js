/**
 * @file
 * @author zdying
 */
var express = require('express');
var colors = require('colors');
var path = require('path');
var fs = require('fs');

var logger = log.namespace('Server');
var config = require('../client/config');

// 中间件
var preHandler = require('./middlewares/preHandler');
var favicon = require('./middlewares/favicon');
var compileSource = require('./middlewares/compileSource');
var webpackHMR = require('./middlewares/webpackHMR');
var source = require('./middlewares/source');

function Server(port, browser, proxy){
    this.app = express();
    this.compilers = {};
    this.proxyServer = null;
    this.port = port;
    this.browser = browser;
    this.proxy = proxy;
}

Server.prototype = {
    constructor: Server,

    start: function(){
        var port = this.port;
        var app = this.app;

        // 请求预处理：去掉url中的hash和参数等
        app.all('*', preHandler);

        // webpack hot module replace
        app.get('/__webpack_hmr', webpackHMR);

        app.use('/__source__/', source.bind(this));

        // favicon.ico
        app.get('*/favicon.ico', favicon.bind(this));

        app.get(/[\w\d]+\.hot\-update\.json([\#\?].*)?$/, function(req, res, next){
            this.sendFile(req, path.join(__hii__.codeTmpdir, req.url))
        }.bind(this));

        // 编译代码的主要逻辑
        app.all('*', compileSource.bind(this));


        this.server = require('http').createServer(app).listen(port);

        if(program.https){
            var hiiConfig = config.get();

            var sslKey = program.sslKey || hiiConfig.sslKey || path.resolve(__dirname, '../../ssl/cert/localhost.key');
            var sslCert = program.sslCert || hiiConfig.sslCert || path.resolve(__dirname, '../../ssl/cert/localhost.crt');
            var option = {
                key: fs.readFileSync(sslKey),
                cert: fs.readFileSync(sslCert)
            };
            this.httpsServer = require('https').createServer(option, app).listen(443);

            log.debug('SSL server use key : ', sslKey.bold.green);
            log.debug('SSL server use cert: ', sslCert.bold.green);
        }

        return new Promise(this.initEvents.bind(this));
    },

    initEvents: function(resolve, reject){
        var server = this.server;
        var port = this.port;
        var self = this;
        var serverCount = this.httpsServer ? 2 : 1;
        var count = 0;

        function onError(err){
            if(err.code === 'EADDRINUSE'){
                console.log('Port', String(port).bold.yellow, 'is already in use.');
            }else if(err.code === 'EACCES'){
                console.log('\nPermission denied.\nPlease try running this command again as root/Administrator.\n');
            }else{
                console.log(err.message);
            }

            self.close();

            reject(err);
        }
        
        function onListening(){
            if(serverCount === 2 && ++count < 2){
                return
            }

            var url = 'http://127.0.0.1:';
            // browser && open(url);

            resolve({
                port: port,
                url: url + port,
                httpsPort: 443,
                httpsUrl: url + 443,
                https: program.https,
                server: this.server,
                httpsServer: this.httpsServer
            });
        }

        server.on('error', onError);
        server.on('listening', onListening.bind(this));

        if(serverCount === 2){
            this.httpsServer.on('error', onError);
            this.httpsServer.on('listening', onListening.bind(this));
        }

        process.on("SIGINT", function(){
            console.log('\b\b  ');
            console.log('Bye Bye.'.bold.yellow);
            process.exit()
        });

        process.on('SIGTERM', function(){
            console.log('Bye Bye.'.bold.yellow);
            process.exit()
        });
    },

    close: function(){
        this.server.close();

        if(this.httpsServer){
            this.httpsServer.close();
        }
    },

    /**
     * 发送文件
     * @param req
     * @param filePath
     * @param env
     */
    sendFile: function(req, filePath){
        filePath = filePath || path.join(__hii__.cwd, req.url);

        logger.debug('send file: ' + filePath.bold);

        var res = req.res;

        res.set('Access-Control-Allow-Origin', '*');

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
        var filePath = path.join(__hii__.codeTmpdir, req.url);

        filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1').replace(/[\\\/]prd[\\\/]/, '/loc/');
        this.sendFile(req, filePath);
    }
};

module.exports = Server;
