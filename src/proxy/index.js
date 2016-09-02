/**
 * @file
 * @author zdying
 */
var http = require('http');
var url = require('url');
var fs = require('fs');

var hostRules = {};

var ser = http.createServer(function(request, response) {
    var uri = url.parse(request.url);
    var start = Date.now();

    var hostname = uri.hostname;
    var port = uri.port;
    var host = hostRules[hostname];

    if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
    }

    var proxy = http.request({
        host: hostname,
        port: port || 80,
        path: uri.path,
        method: request.method
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
}).listen(4936);

ser.on('listening', function(){
    parseHosts();
    
    fs.watchFile(__dirname + '/hosts', function(){
        parseHosts()
    });

    console.log('hiipack proxyed at', ('http://127.0.0.1:4936').yellow.bold);
    console.log()
});

function parseHosts(hosts){
    hostRules = {};

    hosts = hosts || fs.readFileSync(__dirname + '/hosts');

    hosts.toString().split(/\n\r?/).forEach(function(line){
        line = line.replace(/#.*$/, '');

        if(line.trim() === ''){
            return
        }

        var arr = line.split(/\s+/);

        if(arr.length < 2){
            setTimeout(function(){
                log.debug('hosts -', line.bold.yellow, 'ignored')
            }, 0)
        }

        for(var i = 1, len = arr.length; i < len; i++){
            hostRules[arr[i]] = arr[0];
        }
    });

    setTimeout(function(){
        log.debug('hosts - hosts file parsed: ', JSON.stringify(hostRules));
    }, 100);
}