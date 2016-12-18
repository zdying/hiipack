/**
 * @file
 * @author zdying
 */

'use strict';

// var clients = {};
// var clientId = 0;

global.clients = {};
global.clientId = 0;

module.exports = function(req, res, next){
    req.socket.setKeepAlive(true);
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    var id = clientId++;

    clients[id] = res;

    console.log('add client id:', id);

    req.on("close", function(){
        delete clients[id];
    });

    setInterval(function(){
        res.write("data: \uD83D\uDC93\n\n");
    }, 2000)
};