/**
 * @file 获取代理相关的信息
 * @author zdying
 */

var parseHosts = require('./parseHosts');
var parseRewrite = require('./parseRewrite');

var url = require('url');
var fs = require('fs');

var commands = require('./commands');
var getCommands = require('./getCommands');

/**
 * 获取代理信息, 用于请求代理的地址
 * @param {Object} request 请求对象
 * @param {Object} hostsRules 解析后的hosts规则
 * @param {Object} rewriteRules 解析后的rewrite规则
 * @param {Object} [domainCache={}] domain缓存对象, 存储hosts和rewrite中存在的域名, 提高匹配效率
 * @param {Array} [regexpCache=[]] regexp缓存对象, 存储hosts和rewrite中存在的正则表达式, 提高匹配效率
 * @returns {Object}
 */
module.exports = function getProxyInfo(request, hostsRules, rewriteRules, domainCache, regexpCache){
    var uri = url.parse(request.url);
    var rewrite = !!rewriteRules && getRewriteRule(uri, rewriteRules, domainCache || {}, regexpCache || {});
    var host = !!hostsRules && hostsRules[uri.hostname];

    var hostname, port, path, proxyName;

    // rewrite 优先级高于 hosts
    if(rewrite){
        var proxy = rewrite.props.proxy;
        var protocolReg = /^(\w+:\/\/)/;
        var newUrl, newUrlObj;

        //TODO 这里应该有个bug, props是共享的, 一个修改了,其他的也修改了
        var context = {
            request: request,
            props: rewrite.props
        };

        proxy = replaceVar(proxy, rewrite, rewriteRules);

        // 如果代理地址中包含具体协议，删除原本url中的协议
        // 最终替换位代理地址的协议
        if(proxy.match(protocolReg)){
            request.url = request.url.replace(protocolReg, '')
        }

        // 将原本url中的部分替换为代理地址
        if(rewrite.source.indexOf('~') === 0){
            // 正则表达式
            var sourceReg = null;
            var urlMatch = null;

            if(proxy.match(/\$\d/g)){
                sourceReg = toRegExp(rewrite.source, 'i');
                urlMatch = request.url.match(sourceReg);

                // 这里可以不用判断urlMath是否为空, 因为getRewriteRule里面已经测试过
                newUrl = proxy.replace(/\$(\d)/g, function(match, groupID){
                    return urlMatch[groupID]
                })
            }else{
                newUrl = proxy;
            }
        }else{
            // 普通地址字符串
            newUrl = request.url.replace(rewrite.source, proxy);
        }

        newUrlObj = url.parse(newUrl);

        var reqCommands = getCommands(rewrite, 'request');

        if(Array.isArray(reqCommands)){
            log.detail('commands that will be executed [request]:', JSON.stringify(reqCommands).bold);

            reqCommands.forEach(function(obj){
                var name = obj.name;
                var params = obj.params;
                var func = commands[obj.name];

                if(typeof func === 'function'){
                    log.debug('exec rewrite request command', name.bold.green, 'with params', ('[' + params.join(',') + ']').bold.green);
                    func.apply(context, params)
                }else{
                    log.debug(name.bold.yellow, 'is not in the scope', 'request'.bold.green, 'or not exists.')
                }
            })
        }else{
            log.debug('no commands will be executed');
        }

        hostname = newUrlObj.hostname;
        port = newUrlObj.port || 80;
        path = newUrlObj.path;
        proxyName = 'HIIPACK';
    }else if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
        path = uri.path;
        proxyName = 'HIIPACK';
    }else{
        hostname = uri.hostname;
        port = uri.port || 80;
        path = uri.path;
    }

    return {
        proxy_options: {
            host: hostname,
            port: port || 80,
            path: path,
            method: request.method,
            headers: request.headers
        },
        PROXY: proxyName,
        hosts_rule: host,
        rewrite_rule: rewrite
    }
};

/**
 * 根据url查找对应的rewrite规则
 * @param urlObj
 * @param rewriteRules
 * @param domainCache
 * @param regexpCache
 * @returns {*}
 */
function getRewriteRule(urlObj, rewriteRules, domainCache, regexpCache){
    var host = urlObj.hostname;
    var path = urlObj.path;
    var href = urlObj.href;
    var pathWithNoQuery = path.replace(/[\?\#](.*)$/, '');
    var pathArr = pathWithNoQuery.split('/');
    var len = pathArr.length;
    var rewriteRule = null;
    var tryPath = '';

    if(((urlObj.host || urlObj.hostname) in domainCache)){
        while(len--){
            tryPath = host + pathArr.slice(0, len + 1).join('/');

            log.debug('getProxyInfo - try path', tryPath.bold.green);

            if((tryPath in rewriteRules) || ((tryPath += '/') in rewriteRules)){
                rewriteRule = rewriteRules[tryPath];
                break;
            }
        }
    }else{

    }

    regexpCache.forEach(function(rule){
        var reg = toRegExp(rule.source, 'i');

        if(reg.test(href)){
            // 这里匹配成功后还是继续往后匹配下一个正则表达式
            // 也就是后面匹配到的规则会覆盖前面匹配到的规则
            rewriteRule = rule;
        }
    });

    log.debug('getProxyInfo -', href, '==>', JSON.stringify(rewriteRule));

    return rewriteRule
}

function toRegExp(str, flags){
    str = str.replace(/^~\s*\/(.*)\/(\w*)/, '$1 O_o $2');

    var arr = str.split(' O_o ');

    return new RegExp(arr[0], flags === undefined ? arr[2] : flags)
}

function replaceVar(str, rewrite, rewriteRules){
    return str.replace(/\$[\w\d_]+/, function(match){
        if(match in rewrite.props){
            return rewrite.props[match]
        }else if(match in rewriteRules.props){
            return rewriteRules.props[match]
        }else{
            return match
        }
    });
}