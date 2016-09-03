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
    var rewrite = getRewriteRule(uri);
    var host = hostRules[uri.hostname];

    var hostname, port, path, proxyName;

    if(rewrite){
        var target = rewrite.target[0];
        var reg = /^(\w+:\/\/)/;
        var newUrl, newUrlObj;

        if(target.match(reg)){
            request.url = request.url.replace(reg, '')
        }

        newUrl = request.url.replace(rewrite.source, target);
        newUrlObj = url.parse(newUrl);

        hostname = newUrlObj.hostname;
        port = newUrlObj.port || 80;
        path = newUrlObj.path;
        proxyName = 'HIIPACK_PROXY';
    }else if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
        path = uri.path;
        proxyName = 'HIIPACK_PROXY';
    }else{
        hostname = uri.hostname;
        port = uri.port || 80;
        path = uri.path;
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

        if((tryPath in rewriteRules) || ((tryPath += '/') in rewriteRules)){
            rewriteRule = rewriteRules[tryPath];
            break;
        }
    }

    log.debug(host, path, rewriteRule);

    return rewriteRule
}