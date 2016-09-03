/**
 * @file
 * @author zdying
 */

var parseHosts = require('./parseHosts');
var parseRewrite = require('./parseRewrite');

var url = require('url');
var fs = require('fs');

var hostRules = null;
var rewriteRules = null;

// fs.watchFile(__dirname + '/hosts', function(){
//     _parseHosts()
// });
//
// fs.watchFile(__dirname + '/hosts', function(){
//     _parseHosts()
// });

module.exports = function getProxyOption(request, hostsPath, rewritePath){
    if(!hostRules){
        hostRules = parseHosts(hostsPath);
    }

    if(!rewriteRules){
        rewriteRules = parseRewrite(rewritePath)
    }

    var uri = url.parse(request.url);

    var hostname = uri.hostname;
    var port = uri.port;
    var host = hostRules[hostname];
    var path = uri.path;

    var rewrite = getRewriteRule(uri);
    var proxyName = undefined;

    if(rewrite){
        var target = rewrite.target[0];
        var targetObj = url.parse(target);
        hostname = targetObj.hostname;
        port = targetObj.port || 80;
        path = targetObj.path;
        proxyName = 'HIIPACK_PROXY';
    }else if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
        proxyName = 'HIIPACK_PROXY';
    }

    request.headers.host = uri.host;

    return {
        host: hostname,
        port: port || 80,
        path: path,
        method: request.method,
        headers: request.headers,
        HIIPACK_PROXY: proxyName
    }
};

function getRewriteRule(urlObj){
    var host = urlObj.hostname;
    var path = urlObj.path;
    var pathArr = path.split('/');
    var len = pathArr.length;
    var rewriteRule = null;
    var tryPath = '';

    while(len--){
        tryPath = host + pathArr.slice(0, len + 1).join('/');

        if(tryPath in rewriteRules){
            rewriteRule = rewriteRules[tryPath];
            break;
        }
    }

    log.debug(host, path, rewriteRule);

    return rewriteRule
}