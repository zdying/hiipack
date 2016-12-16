/**
 * @file
 * @author zdying
 */

'use strict';

var url = require('url');
var http = require('http');

var logger = log.namespace('proxy -> Server');

var execResponseCommand = require('../execCommand');

module.exports = {
    response: function(rewrite_rule, request, response){
        var _url = request.url;
        var uri = url.parse(_url);

        var proxy = http.request(request.proxy_options, function(res){
            execResponseCommand(rewrite_rule, {
                response: res
            }, 'response');

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

        request.pipe(proxy);
    }
};