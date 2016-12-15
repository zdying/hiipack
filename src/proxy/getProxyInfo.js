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
 * @param {Object}  request 请求对象
 * @param {Object}  hostsRules 解析后的hosts规则
 * @param {Array}   rewriteRules 解析后的rewrite规则
 * @param {Object}  [domainCache={}] domain缓存对象, 存储hosts和rewrite中存在的域名, 提高匹配效率
 * @returns {Object}
 */
module.exports = function getProxyInfo(request, hostsRules, rewriteRules, domainCache){
    var uri = url.parse(request.url);
    var rewrite = !!rewriteRules && getRewriteRule(uri, rewriteRules, domainCache || {});
    var host = !!hostsRules && hostsRules[uri.hostname];

    var hostname, port, path, proxyName;

    // rewrite 优先级高于 hosts
    if(rewrite && rewrite.props.proxy){
        var proxy = rewrite.props.proxy;
        var alias = rewrite.props.alias;
        var protocolReg = /^(\w+:\/\/)/;
        var newUrl, newUrlObj;

        //TODO 这里应该有个bug, props是共享的, 一个修改了,其他的也修改了
        var context = {
            request: request,
            props: rewrite.props
        };

        // 如果代理地址中包含具体协议，删除原本url中的协议
        // 最终替换位代理地址的协议
        if(!alias && proxy.match(protocolReg)){
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
            // 否则，把url中的source部分替换成proxy
            newUrl = request.url.replace(rewrite.source, proxy);
        }

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


        log.debug('newURL ==>', newUrl);
        log.debug('newURL ==>', alias);

        if(alias){
            // 本地文件系统路径, 删除前面的协议部分
            newUrl = newUrl.replace(/^(\w+:\/\/)/, '');
        }else{
            newUrlObj = url.parse(newUrl);

            hostname = newUrlObj.hostname;
            port = newUrlObj.port || 80;
            path = newUrlObj.path;
            proxyName = 'HIIPACK';
        }
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
        rewrite_rule: rewrite,
        alias: alias,
        newUrl: newUrl
    }
};

/**
 * 根据url查找对应的rewrite规则
 * @param urlObj
 * @param rewriteRules
 * @param domainCache
 * @returns {*}
 */
function getRewriteRule(urlObj, rewriteRules, domainCache){
    var hostname = urlObj.hostname;
    var href = urlObj.href;
    var rewriteRule = null;

    var domains = null;
    var rule = null;

    if(hostname in domainCache){
        domains = domainCache[hostname];
        rule = domains[hostname];

        var location = rule.location;
        var urlPath = urlObj.path;
        var loc = null;
        var lastDeep = -1;
        var currentDeep = 0;
        var locPath = '';

        for(var i = 0, len = location.length; i < len; i++){
            loc = location[i];

            locPath = loc.path;

            log.debug('getRewriteRule - current location path =>', locPath.bold.green);

            if(locPath.indexOf('~') === 0){
                /** 正则表达式 **/
                var reg = toRegExp(locPath, 'i');

                if(reg.test(href)){
                    currentDeep = reg.source.replace(/^\\?\/|\\?\/$/, '').split(/\\?\//).length;

                    if(currentDeep > lastDeep){
                        rewriteRule = loc;
                    }

                    log.debug(
                        'getRewriteRule -',
                        'regexp match =>', locPath.match(reg),
                        'deep =>', String(currentDeep).bold.green,
                        'last deep =>', String(lastDeep).bold.green,
                        'should replace last rule =>', String(currentDeep > lastDeep).bold.green
                    );
                }
            }else if(urlPath.indexOf(locPath) === 0){
                /** 非正则表达式 **/
                // 如果url中path以location中的path开头
                currentDeep = locPath.replace(/^\/|\/$/g).split('/').length;

                // 如果是'/', 长度设置为0
                if(currentDeep === 1 && locPath === '/'){
                    currentDeep = 0;
                }

                log.debug('getRewriteRule -', 'get rewrite rule for url =>', urlObj.href.bold.green);
                log.debug(
                    'getRewriteRule -',
                    'current match location.path =>', locPath.bold.green,
                    'deep =>', String(currentDeep).bold.green,
                    'last deep =>', String(lastDeep).bold.green,
                    'should replace last rule =>', String(currentDeep > lastDeep).bold.green
                );

                // 如果匹配的深度比上一次匹配的深度深（比上次匹配更精确）
                // 替换成新匹配到的规则
                if(currentDeep > lastDeep){
                    rewriteRule = loc;
                    lastDeep = currentDeep;
                }
            }
        }
    }else{

    }

    log.debug('getProxyInfo -', href, '==>', JSON.stringify(rewriteRule));

    return rewriteRule
}

function toRegExp(str, flags){
    str = str.replace(/^~\s*\/(.*)\/(\w*)/, '$1 O_o $2');

    var arr = str.split(' O_o ');

    return new RegExp(arr[0], flags === undefined ? arr[2] : flags)
}
