/**
 * @file
 * @author zdying
 */
var http = require('http');
var path = require('path');
var url = require('url');
var net = require('net');
var fs = require('fs');

var getMimeType = require('simple-mime')('text/plain');

var commands = require('./commands');
var merge = require('../helpers/merge');
var config = require('../client/config');

var parseHosts = require('./parseHosts');
var parseRewrite = require('./parseRewrite');
var getProxyInfo = require('./getProxyInfo');
var findHostsAndRewrite = require('./findHostsAndRewrite');
var getCommands = require('./getCommands');

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
        this.hostsRules = { /*"hiipack.xyz": "127.0.0.1"*/ };
        this.rewriteRules = {};
        this.domainCache = {};
        this.regexpCache = [];
    },

    start: function(port, option){
        this.init();

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
     */
    mergeRules: function(type){
        if(type === 'all' || type === 'hosts'){
            this.hostsRules = { /*"hiipack.xyz": "127.0.0.1"*/ };
            Server.cache.hostFiles.forEach(function(file){
                this.mergeHosts(file)
            }.bind(this));
        }

        if(type === 'all' || type === 'rewrite'){
            this.rewriteRules = {};
            Server.cache.rewriteFiles.forEach(function(file){
                this.mergeRewrite(file)
            }.bind(this));
        }
    },

    /**
     * 合并hosts规则，这个只合并，不清空
     * 如果传入的文件以前没有parse过，会先parse，并缓存
     * @param filePath
     */
    mergeHosts: function(filePath){
        var hosts = Server.cache.hosts[filePath];

        if(!hosts){
            Server.cache.hosts[filePath] = hosts = parseHosts(filePath);
            Server.cache.hostFiles.push(filePath);
        }

        this.hostsRules = merge(this.hostsRules, hosts);

        this.updateDomainCache();

        logger.debug('hostsRules updated =>', JSON.stringify(this.hostsRules));
    },

    /**
     * 合并rewrite规则，这个只合并，不清空
     * 如果传入的文件以前没有parse过，会先parse，并缓存
     * @param filePath
     */
    mergeRewrite: function(filePath){
        var rewrite = Server.cache[filePath];

        if(!rewrite){
            Server.cache.rewrite[filePath] = rewrite = parseRewrite(filePath);
            Server.cache.rewriteFiles.push(filePath);
        }

        this.rewriteRules = merge(this.rewriteRules, rewrite);

        this.updateDomainCache();

        logger.debug('rewriteRules updated =>', JSON.stringify(this.rewriteRules));
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
        this.watchFile(filePath, function(){
            this.mergeRules(type)
        }.bind(this));
    },

    requestHandler: function(request, response){
        var uri = url.parse(request.url);
        var start = Date.now();
        var self = this;

        request._startTime = start;

        this.setRequest(request);

        var rewrite_rule = request.rewrite_rule;

        log.detail('proxy request options:', request.url, '==>', JSON.stringify(request.proxy_options));

        // 重定向到本地文件系统
        if(request.alias){
            log.info(request.url + ' ==> ' + request.newUrl);

            response.headers = response.headers || {};

            self.execResponseCommand(rewrite_rule, {
                response: response
            });

            try{
                var stats = fs.statSync(request.newUrl);
                var filePath = request.newUrl;
                var rewrite = request.rewrite_rule;

                if(stats.isDirectory()){
                    filePath += rewrite.props.root || 'index.html'
                }

                // TODO 如果没有root，列出目录
                response.setHeader('Content-Type', getMimeType(filePath));

                //TODO 这里不应该自己调用setHeader，应该继续增强commands中的命令
                for(var key in response.headers){
                    response.setHeader(key, response.headers[key])
                }

                return fs.createReadStream(filePath).pipe(response);
            }catch(e){
                response.setHeader('Content-Type', 'text/html');
                if(e.code === 'ENOENT'){
                    response.statusCode = 404;
                    response.end('404 Not Found: <br><pre>' + e.stack + '</pre>');
                }else{
                    response.statusCode = 500;
                    response.end('500 Server Internal Error: <br><pre>' + e.stack + '</pre>');
                }
            }
        }

        var proxy = http.request(request.proxy_options, function(res){
            self.execResponseCommand(rewrite_rule, {
                response: res
            });

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

    execResponseCommand: function(rewrite_rule, context){
        // call response commands
        var resCommands = rewrite_rule ? getCommands(rewrite_rule, 'response') : null;

        if(Array.isArray(resCommands)){
            log.detail('commands that will be executed [response]:', JSON.stringify(resCommands).bold);

            resCommands.forEach(function(command){
                // var inScope = responseScopeCmds.indexOf(command.name) !== -1;
                var name = command.name;
                var params = command.params || [];
                var isFunction = typeof commands[name] === 'function';

                if(isFunction){
                    log.debug('exec rewrite response command', name.bold.green, 'with params', ('[' + params.join(',') + ']').bold.green);
                    commands[name].apply(context, params);
                }else{
                    log.debug(name.bold.yellow, 'is not in the scope', 'response'.bold.green, 'or not exists.')
                }
            })
        }
    },

    connectHandler: function(request, socket, head){
        var _url = url.parse('http://' + request.url);
        var _cache = this.domainCache[_url.hostname] || this.domainCache[_url.host];

        if(_cache && typeof _cache === 'string'){
            _url.host = _cache;
            _url.hostname = _cache.split(':')[0];
            _url.port = _cache.split(':')[1] || 443;

            if(_url.port != 443){
                _url.port = 443;
            }

            logger.info('https proxy -', request.url.bold.green, '==>', _url.hostname.bold.green);
        }else{
            logger.info('https direc -', request.url.bold);
        }

        var proxySocket = net.connect(_url.port, _url.hostname, function(){
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

    listeningHandler: function(){
        console.log('hiipack proxyed at', ('http://127.0.0.1:4936').yellow.bold);
        console.log('hiipack proxy file', ('file://' + path.resolve(__hii__.cacheTmpdir, 'hiipack.pac')).magenta.bold);
        console.log()
    },

    setRequest: function(request){
        var proxyInfo = getProxyInfo(
                request,
                this.hostsRules,
                this.rewriteRules,
                this.domainCache,
                this.regexpCache
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
        var regexpCache = this.regexpCache = [];
        var hosts = this.hostsRules;
        var rewrite = this.rewriteRules;
        var urlReg = /((\w+):\/\/)?([^/]+)/;
        var matchResult = null;
        var proxy = '';

        //TODO 处理正则表达式, 尝试从正则表达式中提取网址

        for(var domain in hosts){
            domainCache[domain] = hosts[domain];
        }

        for(var url in rewrite){
            // 整个rewrite不仅仅只有url和正则表达式，还有commands/props属性
            if(!url.match(/^(commands|props|__id__)$/)){
                if(url.indexOf('~') === 0){
                    regexpCache.push(rewrite[url])
                }else{
                    matchResult = url.match(urlReg);

                    proxy = rewrite[url].props.proxy;

                    if(matchResult && matchResult[3]){
                        domainCache[matchResult[3]] = path.isAbsolute(proxy) ? "127.0.0.1" : ((proxy.match(urlReg) || [])[3] || 1);
                    }else{
                        log.warn('hiipack can not parse url:', url.bold.yellow);
                    }
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

            if(!host.match(/^(localhost|::1|127.0.0.1)$/) && SYS_PROXY){
                return SYS_PROXY
            }else{
                return DIRECT;
            }
        }

        var sysProxy = config.get('system_proxy');

        var txt = [
            'var SYS_PROXY = "' + (sysProxy ? 'PROXY ' + sysProxy : '') + '";\n',
            'var PROXY = "PROXY 127.0.0.1:4936";\n',
            'var DIRECT = "DIRECT";\n\n',
            'var DOMAINS = ' + JSON.stringify(domainsCache, null, 4) + ';\n\n',
            FindProxyForURL.toString()
        ];

        fs.writeFile(path.resolve(__hii__.cacheTmpdir, 'hiipack.pac'), txt.join(''), function(err){
            err && logger.error(err);
        });
    }
};

module.exports = Server;
