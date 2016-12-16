/**
 * @file
 * @author zdying
 */
var http = require('http');
var path = require('path');
var url = require('url');
var net = require('net');
var fs = require('fs');

var aliasWorker = require('./workers/alias');
var requestWorker = require('./workers/request');

var merge = require('../../helpers/merge');

var parseHosts = require('../tools/parseHosts');
var parseRewrite = require('../tools/parseRewrite');
var findHostsAndRewrite = require('../tools/findHostsAndRewrite');
var createPacFile = require('../tools/createPacFile');

var getProxyInfo = require('./getProxyInfo');

var logger = log.namespace('proxy -> Server');

//TODO 多个工程的规则合并时, commands等有问题,但是不影响功能,待修复

//TODO 支持rewrite到hosts中的host时

function Server(){}

Server.cache = {
    hosts: {},
    rewrite: {},
    hostFiles: [],
    rewriteFiles: [],
    watchingList: {}
};

Server.prototype = {
    constructor: Server,

    init: function(){
        this.server = null;
        this.hostsRules = {};
        this.rewriteRules = [];
        this.domainCache = {};
    },

    start: function(port, option){
        this.init();

        this.port = Number(port) || 4936;

        this.server = http.createServer()
            .listen(this.port);

        return new Promise(this.initEvent.bind(this));
    },

    initEvent: function(resolve, reject){
        var port = this.port;
        var url = 'http://127.0.0.1:' + port;
        var pac = url + '/proxy.pac';
        var server = this.server;

        server
            .on('listening', function(){
                resolve({
                    port: port,
                    url: url,
                    pac: pac,
                    server: server
                });

                this.find();
            }.bind(this))
            .on('error', function(err){
                reject(err)
            })
            .on('request', this.requestHandler.bind(this))
            .on('connect', this.connectHandler.bind(this))
    },

    stop: function(){
        this.server.close();
    },

    restart: function(){
        this.stop();
        this.start();
    },

    find: function(){
        var self = this;

        findHostsAndRewrite(function(err, hosts, rewrites){
            if(err){
                return logger.error(err);
            }

            logger.debug('findHostsAndRewrite - hosts [', hosts.join(', ').bold.green, ']');
            logger.debug('findHostsAndRewrite - rewrites [', (rewrites.join(', ')).bold.green, ']');

            // 将找到的Hosts文件解析并加入缓存
            hosts.forEach(function(hostFile){
                self.addFile(hostFile, 'hosts');
            });

            // 将找到的rewrite文件解析并加入缓存
            rewrites.forEach(function(rewriteFile){
                self.addFile(rewriteFile, 'rewrite');
            });
        })
    },

    /**
     * 添加配置文件
     * @param {String} filePath 文件路径
     * @param {String} type 文件类型：hosts|rewrite
     */
    addFile: function(filePath, type){
        var fun = {
            'hosts': 'mergeHosts',
            'rewrite': 'mergeRewrite'
        };

        logger.debug('add'.bold.green, type, 'file', filePath.bold.green);

        this[fun[type]](filePath);

        // 只要文本改动了，就先清空对应类型的规则，然后重新merge
        this.watchFile(filePath, function(filePath){
            this.mergeRules(type, filePath)
        }.bind(this));
    },

    watchFile: function(file, cbk){
        if(Server.cache.watchingList[file]){
            return
        }

        Server.cache.watchingList[file] = true;

        fs.watchFile(file, {interval: 2000}, function(curr, prev){
            if(curr.mtime !== prev.mtime){
                logger.debug(file.bold.green, 'changed.');
                cbk && cbk(file)
            }
        })
    },

    /**
     * 合并代理规则，包括rewrite和hosts
     * 调用这个方法的时候，会先清空原来对应的规则
     * 如果type为'all', 清空所有的规则，然后merge
     * 如果type为'hosts', 清空hosts规则，然后merge hosts
     * 如果type为'rewrite', 清空rewrite规则，然后merge rewrite
     *
     * @param {String} type 需要merge的类型：all|hosts|rewrite
     * @param {String} changedFile 发生更改的文件
     */
    mergeRules: function(type, changedFile){
        if(type === 'all' || type === 'hosts'){
            this.hostsRules = {};
            Server.cache.hostFiles.forEach(function(file){
                this.mergeHosts(file, changedFile === file)
            }.bind(this));
        }

        if(type === 'all' || type === 'rewrite'){
            this.rewriteRules = [];
            Server.cache.rewriteFiles.forEach(function(file){
                this.mergeRewrite(file, changedFile === file)
            }.bind(this));
        }
    },

    /**
     * 合并hosts规则，这个只合并，不清空
     * @param filePath
     * @param reParse
     */
    mergeHosts: function(filePath, reParse){
        var cache = Server.cache;
        var hosts = cache.hosts[filePath];

        if(reParse || !hosts){
            log.debug('parse and merge hosts file:', filePath.bold.green);

            cache.hosts[filePath] = hosts = parseHosts(filePath);
            cache.hostFiles.push(filePath);
        }else{
            log.debug('use cache for hosts file:', filePath.bold.green);
        }

        this.hostsRules = merge(this.hostsRules, hosts);

        this.updateDomainCache();

        logger.debug('hostsRules updated =>', JSON.stringify(this.hostsRules));
    },

    /**
     * 合并rewrite规则，这个只合并，不清空
     * @param filePath
     * @param reParse
     */
    mergeRewrite: function(filePath, rePrase){
        var cache = Server.cache;
        var rewrite = cache.rewrite[filePath];

        if(rePrase || !rewrite){
            log.debug('parse and merge rewrite file:', filePath.bold.green);

            cache.rewrite[filePath] = rewrite = parseRewrite(filePath);
            cache.rewriteFiles.push(filePath);
        }else{
            log.debug('use cache for rewrite file:', filePath.bold.green);
        }

        this.rewriteRules.push(rewrite);

        this.updateDomainCache();

        logger.debug('rewriteRules updated =>', JSON.stringify(this.rewriteRules));
    },

    requestHandler: function(request, response){
        var _url = request.url;
        var start = Date.now();
        var pacFilePath = path.resolve(__hii__.cacheTmpdir, 'hiipack.pac');

        if(_url === '/'){
            response.end('proxy file url: http://127.0.0.1:' + this.port + '/proxy.pac');
            return
        }

        if(_url === '/proxy.pac'){
            fs.readFile(pacFilePath, 'utf-8', function(err, str){
                 response.end(str);
            });
            return
        }

        request._startTime = start;

        this.setRequest(request);

        var rewrite_rule = request.rewrite_rule;

        log.detail('proxy request options:', request.url, '==>', JSON.stringify(request.proxy_options));

        // 重定向到本地文件系统
        if(request.alias){
            return aliasWorker.response(rewrite_rule, request, response);
        }

        return requestWorker.response(rewrite_rule, request, response);
    },

    connectHandler: function(request, socket, head){
        var _url = url.parse('http://' + request.url);
        var _cache = this.domainCache[_url.hostname];
        var proxy = _cache[_url.hostname].location[0].props.proxy;

        if(proxy){
            var obj = url.parse(proxy);
            if(obj.port != 443){
                obj.port = 443;
            }

            logger.info('https proxy -', request.url.bold.green, '==>', obj.hostname.bold.green);
        }else{
            logger.info('https direc -', request.url.bold);
        }

        var proxySocket = net.connect(obj.port, obj.hostname, function(){
            socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxySocket.write(head);
            proxySocket.pipe(socket);
        }).on('error', function(e){
            console.log('proxy error', e.message);
            socket.end();
        }).on('data', function(data){
            // console.log('proxy socker data:', data.toString());
            // socket.write(data);
        });

        socket.pipe(proxySocket);
    },

    setRequest: function(request){
        var proxyInfo = getProxyInfo(
                request,
                this.hostsRules,
                this.rewriteRules,
                this.domainCache
            );

        request.proxy_options = proxyInfo.proxy_options;
        request.hosts_rule = proxyInfo.hosts_rule;
        request.rewrite_rule = proxyInfo.rewrite_rule;
        request.PROXY = proxyInfo.PROXY;
        request.alias = proxyInfo.alias;
        request.newUrl = proxyInfo.newUrl;

        return request;
    },

    /**
     * 缓存hosts和rewrite中的域名, 提高匹配效率
     */
    updateDomainCache: function(){
        var domainCache = this.domainCache = {};
        var hosts = this.hostsRules;
        var rewrites = this.rewriteRules;

        for(var domain in hosts){
            domainCache[domain] = hosts[domain];
        }

        rewrites.forEach(function(rewrite){
            for(var url in rewrite.domains){
                domainCache[url] = rewrite.domains;
            }
        });

        createPacFile(domainCache);

        logger.debug('domain cache updated', Object.keys(domainCache));
        logger.detail('domain cache updated', JSON.stringify(domainCache));
    }
};

module.exports = Server;
