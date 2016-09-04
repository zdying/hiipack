/**
 * @file
 * @author zdying
 */
var http = require('http');
var url = require('url');
var net = require('net');
var fs = require('fs');

var commands = require('./commands');
var merge = require('../helpers/merge');

var parseHosts = require('./parseHosts');
var parseRewrite = require('./parseRewrite');
var getProxyInfo = require('./getProxyInfo');
var findHostsAndRewrite = require('./findHostsAndRewrite');

var logger = log.namespace('proxy -> Server');

//TODO 支持rewrite到hosts中的host时

function Server(){
    this.server = null;
    this.hostsRules = null;
    this.rewriteRules = null;
}

Server.prototype = {
    constructor: Server,

    start: function(port, option){
        this.server = http.createServer()
            .on('listening', this.listeningHandler.bind(this))
            .on('request', this.requestHandler.bind(this))
            .on('connect', this.connectHandler.bind(this))
            .listen(Number(port) || 4936);

        this.find();
    },

    stop: function(){
        this.server.close();
    },

    watch: function(){

    },

    find: function(){
        var self = this;

        findHostsAndRewrite(function(err, hosts, rewrites){
            if(err){
                return logger.error(err);
            }

            logger.debug('findHostsAndRewrite - hosts [', hosts.join(', ').bold.green, ']');
            logger.debug('findHostsAndRewrite - rewrites [', (rewrites.join(', ')).bold.green, ']');

            hosts.forEach(function(hostFile){
                self.updateHosts(hostFile)
            });

            rewrites.forEach(function(rewriteFile){
                self.updateRewrite(rewriteFile)
            })
        })
    },

    updateHosts: function(filePath){
        var hosts = parseHosts(filePath);

        if(!this.hostsRules){
            this.hostsRules = hosts;
        }else{
            this.hostsRules = merge(this.hostsRules, hosts)
        }

        logger.debug('hostsRules updated =>', JSON.stringify(this.hostsRules));
    },

    updateRewrite: function(filePath){
        var rewrite = parseRewrite(filePath);

        if(!this.rewriteRules){
            this.rewriteRules = rewrite;
        }else{
            this.rewriteRules = merge(this.rewriteRules, rewrite)
        }

        logger.debug('rewriteRules updated =>', JSON.stringify(this.rewriteRules));
    },
    
    addHostsFile: function(filePath){
        logger.debug('add hosts file', filePath.bold.green);
        this.updateHosts(filePath);
    },
    
    addRewriteFile: function(filePath){
        logger.debug('add rewrite file', filePath.bold.green);
        this.updateRewrite(filePath);
    },

    requestHandler: function(request, response){
        var uri = url.parse(request.url);
        var start = Date.now();

        request._startTime = start;

        this.setRequest(request);

        var proxy = http.request(request.proxy_options, function(res){
            var hosts_rule = request.hosts_rule;
            var rewrite_rule = request.rewrite_rule;
            var context = {
                response: res
            };

            // call response commands
            var resCommands = rewrite_rule && rewrite_rule.funcs;

            if(Array.isArray(resCommands)){
                resCommands.forEach(function(command){
                    if(!command.func.match(/^proxy/)){
                        commands[command.func].apply(context, command.params)
                    }
                })
            }

            // response.pipe(res);
            response.writeHead(res.statusCode, res.headers);
            res.on('data', function(chunk){
                response.write(chunk);
            });
            res.on('end', function(){
                var proxyOption = request.proxy_options;
                request.res = res;
                response.end();
                if(request.PROXY){
                    logger.access(request, uri.protocol + '//' + proxyOption.host + (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path)
                }else{
                    logger.access(request);
                    // logger.info('direc -', request.url.bold, Date.now() - start, 'ms');
                }
            });
        });

        proxy.on('error', function(e){
            if(e.code === 'ENOTFOUND'){
                response.statusCode = 404;
                response.end();
            }else{
                logger.error('proxy error:', request.url);
                logger.detail(e.stack);
                response.end(e.stack);
            }
            request.res = response;
            log.access(request)
        });

        proxy.write('');
        proxy.end();
    },

    connectHandler: function(request, socket, head){
        var _url = url.parse('http://' + request.url);

        logger.info('direc -', request.url.bold);

        var proxySocket = net.connect(_url.port || 80, _url.hostname, function(){
            socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxySocket.pipe(socket);
        }).on('error', function(e){
            console.log('e', e.message);
            socket.end();
        });

        socket.pipe(proxySocket);
    },

    listeningHandler: function(){
        console.log('hiipack proxyed at', ('http://127.0.0.1:4936').yellow.bold);
        console.log()
    },

    setRequest: function(request){
        // var proxyInfo = getProxyInfo(request, __dirname + '/hosts', __dirname + '/rewrite');
        var proxyInfo = getProxyInfo(request, this.hostsRules, this.rewriteRules);

        request.proxy_options = proxyInfo.proxy_options;
        request.hosts_rule = proxyInfo.hosts_rule;
        request.rewrite_rule = proxyInfo.rewrite_rule;
        request.PROXY = proxyInfo.PROXY;

        return request;
    }
};

module.exports = Server;