/**
 * @file
 * @author zdying
 */
var http = require('http');
var url = require('url');
var net = require('net');
var fs = require('fs');

var parseHosts = require('./parseHosts');

var hostRules = {};

http.createServer()
    .on('listening', listeningHandler)
    .on('request', requestHandler)
    .on('connect', connectHandler)
    .listen(4936);

function requestHandler(request, response){
    var uri = url.parse(request.url);
    var start = Date.now();

    var hostname = uri.hostname;
    var port = uri.port;
    var host = hostRules[hostname];

    request.headers.host = uri.host;

    if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
    }

    var proxy = http.request({
        host: hostname,
        port: port || 80,
        path: uri.path,
        method: request.method,
        headers: request.headers
    }, function(res){
        // response.pipe(res);
        response.writeHead(res.statusCode, res.headers);
        res.on('data', function(chunk){
            response.write(chunk);
        });
        res.on('end', function(){
            response.end();
            if(host){
                log.info('proxy -', request.url.bold, '==>', (uri.protocol + '//' + host + uri.path).bold, Date.now() - start, 'ms');
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

function connectHandler(request, socket, head){
    var _url = url.parse('http://' + request.url);

    log.info('direc -', request.url.bold);

    var proxySocket = net.connect(_url.port || 80, _url.hostname, function(){
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.pipe(socket);
    }).on('error', function(e){
        console.log('e', e.message);
        socket.end();
    });

    socket.pipe(proxySocket);
}

function listeningHandler(){
    _parseHosts();
    
    fs.watchFile(__dirname + '/hosts', function(){
        _parseHosts()
    });

    console.log('hiipack proxyed at', ('http://127.0.0.1:4936').yellow.bold);
    console.log()
}

function _parseHosts(){
    hostRules = parseHosts(__dirname + '/hosts');

    console.log(JSON.stringify(hostRules, null, 4))
}