/**
 * @file
 * @author zdying
 */
var http = require('http');
var url = require('url');
var net = require('net');
var fs = require('fs');

var commands = require('./commands');

var parseHosts = require('./parseHosts');
var getProxyInfo = require('./getProxyInfo');

//TODO 支持rewrite到hosts中的host时

function Server(){
    this.server = null;
}

Server.prototype = {
    constructor: Server,

    start: function(port, option){
        this.server = http.createServer()
            .on('listening', listeningHandler)
            .on('request', requestHandler)
            // .on('connect', connectHandler)
            .listen(Number(port) || 4936);
    },

    stop: function(){
        this.server.close();
    },

    watch: function(){

    },

    updateHosts: function(){

    },

    updateRewrite: function(){
        
    },
    
    addHostsFile: function(){
        
    },
    
    addRewriteFile: function(){
        
    }
};

function requestHandler(request, response){
    var uri = url.parse(request.url);
    var start = Date.now();

    setRequest(request);

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
            response.end();
            if(request.HIIPACK_PROXY){
                log.info('proxy -', request.url.bold, '==>', (uri.protocol + '//' + proxyOption.host + (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path).bold, Date.now() - start, 'ms');
            }else{
                log.info('direc -', request.url.bold, Date.now() - start, 'ms');
            }
        });
    });

    proxy.on('error', function(e){
        console.log(e.message)
    });

    proxy.write('');
    proxy.end();
}

// function connectHandler(request, socket, head){
//     var _url = url.parse('http://' + request.url);
//
//     log.info('direc -', request.url.bold);
//
//     var proxySocket = net.connect(_url.port || 80, _url.hostname, function(){
//         socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
//         proxySocket.pipe(socket);
//     }).on('error', function(e){
//         console.log('e', e.message);
//         socket.end();
//     });
//
//     socket.pipe(proxySocket);
// }

function listeningHandler(){
    console.log('hiipack proxyed at', ('http://127.0.0.1:4936').yellow.bold);
    console.log()
}

function setRequest(request){
    var proxyInfo = getProxyInfo(request, __dirname + '/hosts', __dirname + '/rewrite');

    request.proxy_options = proxyInfo.proxy_options;
    request.hosts_rule = proxyInfo.hosts_rule;
    request.rewrite_rule = proxyInfo.rewrite_rule;

    return request;
}

module.exports = Server;