/**
 * @file
 * @author zdying
 */
var http = require('http');
var path = require('path');
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

//TODO 多个工程的规则合并时, commands等有问题,但是不影响功能,待修复

var responseScopeCmds = [
    'set_header',
    'set_cookie',
    'hide_header',
    'hide_cookie'
];

//TODO 支持rewrite到hosts中的host时

function Server(){
    this.server = null;
    this.hostsRules = null;
    this.rewriteRules = null;
    this.domainCache = {};
    this.regexpCache = [];
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

        this.updateDomainCache();

        logger.debug('hostsRules updated =>', JSON.stringify(this.hostsRules));
    },

    updateRewrite: function(filePath){
        var rewrite = parseRewrite(filePath);

        if(!this.rewriteRules){
            this.rewriteRules = rewrite;
        }else{
            this.rewriteRules = merge(this.rewriteRules, rewrite)
        }

        this.updateDomainCache();

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

        log.detail('proxy request options:', request.url, '==>', JSON.stringify(request.proxy_options));

        var proxy = http.request(request.proxy_options, function(res){
            var hosts_rule = request.hosts_rule;
            var rewrite_rule = request.rewrite_rule;
            var context = {
                response: res
            };

            // call response commands
            var resCommands = rewrite_rule && rewrite_rule.commands;

            if(Array.isArray(resCommands)){
                resCommands.forEach(function(command){
                    var inScope = responseScopeCmds.indexOf(command.name) !== -1;
                    var isFunction = typeof commands[command.name] === 'function';

                    if(inScope && isFunction){
                        commands[command.name].apply(context, command.params)
                    }else{
                        log.debug(command.name.bold.yellow, 'is not in the scope', 'response'.bold.green, 'or not exists.')
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
        var proxyInfo = getProxyInfo(request, this.hostsRules, this.rewriteRules, this.domainCache, this.regexpCache);

        request.proxy_options = proxyInfo.proxy_options;
        request.hosts_rule = proxyInfo.hosts_rule;
        request.rewrite_rule = proxyInfo.rewrite_rule;
        request.PROXY = proxyInfo.PROXY;

        return request;
    },

    /**
     * 缓存hosts和rewrite中的域名, 提高匹配效率
     */
    updateDomainCache: function(){
        var domainCache = this.domainCache = {};
        var regexpCache = this.regexpCache = [];
        var hosts = this.hostsRules;
        var rewrite = this.rewriteRules;

        //TODO 处理正则表达式, 尝试从正则表达式中提取网址

        for(var domain in hosts){
            domainCache[domain] = 1;
        }

        for(var url in rewrite){
            if(!url.match(/^(commands|props)$/)){
                if(url.indexOf('~') === 0){
                    regexpCache.push(rewrite[url])
                }else{
                    url = url.split('/')[0];
                    domainCache[url] = 1;
                }
            }
        }

        this.createPacFile(domainCache);
        logger.debug('domain cache updated', JSON.stringify(domainCache));
        logger.debug('regexp cache updated', JSON.stringify(regexpCache));
    },
    
    createPacFile: function(domainsCache){
        function FindProxyForURL(url, host) {
            host = host.toLowerCase();

            var hostArr = host.split('.');
            var length = hostArr.length;
            var subHost = "";

            if(length > 1){
                for(var i = 1; i <= length; i++){
                    subHost = hostArr.slice(-i).join('.');
                    if(subHost in DOMAINS){
                        return PROXY;
                    }
                }
            }

            return DIRECT;
        }

        var txt = [
            'var PROXY = "PROXY 127.0.0.1:4936";\n',
            'var DIRECT = "DIRECT";\n\n',
            'var DOMAINS = ' + JSON.stringify(domainsCache, null, 4) + ';\n\n',
            FindProxyForURL.toString()
        ];

        fs.writeFile(path.resolve(__dirname, 'pac', 'hiipack.pac'), txt.join(''));
    }
};

module.exports = Server;