/**
 * @file
 * @author zdying
 */

'use strict';
var fs = require('fs');
var Server = require('./Server');
var os = require('os');
var ProxyServer = require('../proxy');
var proxyConfig = require('./proxyConfig');
var detectBrowser = require('./detectBrowser');

module.exports = {
    init: function(){

    },

    /**
     * 启动一个服务
     */
    start: function(port, browser, proxy){
        __hii__.env = 'loc';

        this.showWarnInfo();

        var self = this;
        var url = 'http://127.0.0.1:' + port;
        var proxyPort = program.proxyPort || 4936;

        var servers = [new Server(port)];

        if(proxy){
            servers.push(new ProxyServer(proxyPort));
        }

        var promises = servers.map(function(server){
            return server.start();
        });

        Promise.all(promises)
            .then(function(servers){
                if(browser){
                    self.openBrowser(browser, url);
                }
                self.showServerInfo(servers);
            })
            .catch(function(err){
                log.error(err)
            })
    },

    showWarnInfo: function(){
        if(fs.existsSync(__hii__.cwd + '/hii.config.js')){
            console.log('');
            log.warn(__hii__.cwd.bold.yellow , 'looks like a hiipack project, try starting the service from the parent.');
            console.log('');
        }
    },

    showServerInfo: function(servers){
        var hiiServer = servers[0];
        var proxyServer = servers[1];

        var lines = [
            'hiipack works root  ' + __hiipack__.cwd.green.bold,
            'hiipack started at  ' + hiiServer.url.red.bold,
            'https server state  ' + (hiiServer.https ? hiiServer.httpsUrl : 'disabled').bold.magenta,
        ];

        if(proxyServer){
            lines.push('hiipack proxyed at  ' + proxyServer.url.yellow.bold);
            lines.push('hiipack proxy file  ' + proxyServer.pac.blue.bold)
        }

        // var max = 0;
        //
        // lines.forEach(function(l){
        //     var len = l.length;
        //
        //     if(len > max){
        //         max = len;
        //     }
        // });

        var hf = new Array(60).join('~');
        console.log();
        console.log(lines.join('\n'));
        console.log();
    },

    openBrowser: function(browser, url){

        // Firefox pac set
        // http://www.indexdata.com/connector-platform/enginedoc/proxy-auto.html
        // http://kb.mozillazine.org/Network.proxy.autoconfig_url
        // user_pref("network.proxy.autoconfig_url", "http://us2.indexdata.com:9005/id/cf.pac");
        // user_pref("network.proxy.type", 2);

        var browserPath = detectBrowser(browser);

        if(!browserPath){
            log.error('can not find browser', browser.bold.yellow);
        }else{
            var dataDir = __hii__.cacheTmpdir;

            if(os.platform() === 'win32'){
                browserPath = '"' + browserPath + '"';
            }

            var command = browserPath + ' ' + proxyConfig[browser](dataDir, url, browserPath);
            // var command = browserPath + ' --proxy-server="http://127.0.0.1:' + 4936 + '"  --user-data-dir='+ dataDir +'  --lang=local  ' + url;
            log.debug('open ==> ', command);
            require('child_process').exec(command, function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    }
};
