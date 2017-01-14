/**
 * @file 代理请求转发到其他服务器
 * @author zdying
 */

'use strict';

var logger = log.namespace('proxy -> Server');

var execResponseCommand = require('../execCommand');

module.exports = {
    response: function(rewrite_rule, request, response){
        var url = require('url');
        var http = require('http');
        var https = require('https');

        var proxyOption = request.proxy_options;
        var isHTTPS = proxyOption.protocol === 'https:';

        if(isHTTPS){
            proxyOption.rejectUnauthorized = false;
        }

        var proxy = (isHTTPS ? https : http).request(proxyOption, function(res){
            response.headers = res.headers;

            execResponseCommand(rewrite_rule, {
                response: response
            }, 'response');

            // response.pipe(res);
            response.writeHead(res.statusCode, res.headers);

            /*
            res.pause();

            log.warn('request was paused:'.red, _url.bold.red);

            setTimeout(function(){
                res.resume();                
                log.warn('request was resumed:'.red, _url.bold.red);
            }, 5000)
            */

            res.on('data', function(chunk){
                // console.log('res.on.data ===>', chunk.toString());
                response.write(chunk);
            });
            res.on('end', function(){
                request.res = res;
                response.end();

                if(request.PROXY){
                    logger.access(request, (proxyOption.protocol || 'http:') + '//' + proxyOption.host + (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path)
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
                response.statusCode = 500;
                response.end(e.stack);
            }
            request.res = response;
            log.access(request)
        });

        request.pipe(proxy);
    }
};